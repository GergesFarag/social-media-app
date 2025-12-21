import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { JwtPayload } from 'src/types/jwtPayload';
import { Post } from 'src/post/schema/post.schema';
import { IQuery, sortingMap } from 'src/_core/interfaces/query.interface';
import { PaginatedResponseDto } from 'src/_core/dto/response.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async create(createCommentDto: CreateCommentDto, currentUser: JwtPayload) {
    const session = await this.commentModel.db.startSession();
    session.startTransaction();
    try {
      const { content, postId, parentCommentId } = createCommentDto;
      const post = await this.postModel.findById(new Types.ObjectId(postId));
      if (!post) {
        throw new BadRequestException('No posts found to comment on');
      }
      let level = 0;
      let rootComment: null | Types.ObjectId = null;

      if (parentCommentId) {
        const parentComment = await this.commentModel
          .findById(parentCommentId)
          .session(session);
        if (!parentComment) {
          throw new BadRequestException('Parent comment not found');
        }
        if (parentComment.post._id.toString() !== post._id.toString()) {
          throw new BadRequestException('Invalid Comment or Post');
        }
        if (parentComment.levels >= 5) {
          throw new BadRequestException(
            'Maximum nesting depth (5 levels) reached',
          );
        }
        level = parentComment.levels + 1;
        rootComment = parentComment.rootComment || parentComment._id;
        await this.commentModel.updateOne(
          { _id: parentCommentId },
          { $inc: { repliesCount: 1 } },
          { session },
        );
      }

      const [newComment] = (await (this.commentModel.create as any)(
        [
          {
            author: new Types.ObjectId(currentUser.id),
            content,
            post: new Types.ObjectId(postId),
            parentComment: parentCommentId
              ? new Types.ObjectId(parentCommentId)
              : null,
            rootComment,
            levels: level,
          } as any,
        ],
        { session } as any,
      )) as CommentDocument[];
      await this.postModel.updateOne(
        { _id: postId },
        { $inc: { commentsCount: 1 } },
        { session },
      );

      await session.commitTransaction();
      // Populate after transaction
      return await this.commentModel
        .findById(newComment._id)
        .populate('author', 'username');
    } catch (err) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await session.endSession();
    }
  }

  async findPostComments(
    postId: string,
    query: IQuery,
  ): Promise<PaginatedResponseDto<Comment>> {
    const { limit = 10, page = 1, sort = 'newest' } = query;

    const filter = {
      post: new Types.ObjectId(postId),
      levels: 0,
      isDeleted: false,
    };

    const [data, totalItems] = await Promise.all([
      this.commentModel
        .find(filter)
        .populate('author', 'username')
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .sort(sortingMap[sort]),
      this.commentModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        limit: +limit,
        page: +page,
        totalItems,
        totalPages: Math.ceil(totalItems / +limit),
      },
      status: 'success',
    };
  }

  async getRepliesOnComment(
    commentId: string,
    query: IQuery,
  ): Promise<PaginatedResponseDto<Comment>> {
    const commentItself = await this.commentModel.findById(commentId);
    if (!commentItself || commentItself.isDeleted) {
      throw new BadRequestException('No Comment Found with this ID');
    }
    const { limit = 10, page = 1, sort = 'newest' } = query;
    const filters = {
      parentComment: new Types.ObjectId(commentId),
      isDeleted: false,
    };
    const data = await this.commentModel
      .find(filters)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .populate('author', 'username')
      .sort(sortingMap[sort]);
    return {
      data,
      meta: {
        limit: +limit,
        page: +page,
        totalItems: commentItself?.repliesCount,
        totalPages: Math.ceil(commentItself?.repliesCount / +limit),
      },
      status: 'success',
    };
  }

  async update(commentId: string, body: UpdateCommentDto, user: JwtPayload) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new BadRequestException('Invalid comment id');
    if (comment.isDeleted) {
      throw new BadRequestException('Cannot update deleted comment');
    }
    if (comment.author._id.toString() !== user.id.toString()) {
      throw new UnauthorizedException('Cannot update this comment');
    }
    comment.content = body.content;
    comment.isEdited = true;
    await comment.save();

    return await this.commentModel
      .findById(commentId)
      .populate('author', 'username');
  }

  async remove(
    commentId: string,
    currentUser: JwtPayload,
    body?: DeleteCommentDto,
  ) {
    const session = await this.commentModel.db.startSession();
    session.startTransaction();
    try {
      const comment = await this.commentModel
        .findById(commentId)
        .where('isDeleted')
        .equals(false)
        .session(session);
      if (!comment) throw new BadRequestException('Invalid Comment Id');
      if (comment.author._id.toString() !== currentUser.id.toString()) {
        throw new UnauthorizedException('Unauthorized to delete this comment');
      }
      if (comment.repliesCount === 0) {
        await this.handleNonRepliedComment(comment, session, body);
      } else {
        await this.handleRepliedComment(comment, session, body);
      }
      await session.commitTransaction();
      return { isDeleted: true };
    } catch (err) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await session.endSession();
    }
  }

  private async handleNonRepliedComment(
    comment: CommentDocument,
    session: ClientSession,
    body?: DeleteCommentDto,
    countOfComments: number = 1,
  ) {
    comment.isDeleted = true;
    comment.deletedReason = body?.deleteReason;
    await comment.save({ session });
    if (comment.parentComment) {
      await this.commentModel.findByIdAndUpdate(
        comment.parentComment,
        {
          $inc: { repliesCount: -countOfComments },
        },
        { session },
      );
    }
    await this.postModel.findByIdAndUpdate(
      comment.post,
      {
        $inc: { commentsCount: -countOfComments },
      },
      { session },
    );
  }
  private async handleRepliedComment(
    comment: CommentDocument,
    session: ClientSession,
    body?: DeleteCommentDto,
  ) {
    const deletedComments = await this.commentModel.updateMany(
      {
        rootComment: comment._id,
      },
      {
        $set: {
          isDeleted: true,
          deletedReason: body?.deleteReason,
        },
      },
      { session },
    );
    await this.handleNonRepliedComment(
      comment,
      session,
      body,
      deletedComments.modifiedCount + 1,
    );
  }
}
