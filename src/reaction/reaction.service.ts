import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Reaction } from './schema/reaction.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { JwtPayload } from 'src/types/jwtPayload';
import { ReactionType } from './types/reaction.type';
import { User } from 'src/user/schemas/user.schema';
import { Post, PostDocument } from 'src/post/schema/post.schema';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<Reaction>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  findAll() {
    return this.reactionModel.find();
  }
  async addReaction(
    createReactionDto: CreateReactionDto,
    currentUser: JwtPayload,
  ) {
    const session = await this.reactionModel.db.startSession();
    session.startTransaction();

    try {
      const { postId } = createReactionDto;
      const userId = new Types.ObjectId(currentUser.id);
      const post = await this.postModel.findById(postId).session(session);
      if (!post) {
        throw new BadRequestException('No postId found');
      }
      const result = await this.reactionHandler(
        createReactionDto,
        post,
        userId,
        session,
      );
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private async reactionHandler(
    reactionDto: CreateReactionDto,
    post: PostDocument,
    userId: Types.ObjectId,
    session: ClientSession,
  ) {
    const isExists = await this.findExistingReaction(post._id, userId, session);
    // not existed => add reaction directly
    if (!isExists) {
      return this.handleNewReaction(reactionDto.type, userId, post, session);
    }

    // existed with same type => remove it
    if (isExists.type === reactionDto.type) {
      return this.handleExistingWithSameType(isExists._id, post, session);
    }

    // existed with different type => remove existed and add the new
    return this.handleExistingWithDifferentType(
      isExists._id,
      post,
      reactionDto,
      session,
    );
  }

  private async handleExistingWithDifferentType(
    reactionId: Types.ObjectId,
    post: PostDocument,
    reactionDto: CreateReactionDto,
    session: ClientSession,
  ) {
    const oldReaction = await this.reactionModel
      .findByIdAndUpdate(reactionId, { type: reactionDto.type }, { new: true })
      .session(session);
    if (!oldReaction) throw new NotFoundException('No Reaction Found');
    post.reactions[oldReaction.type] = Math.max(
      0,
      (post.reactions[oldReaction.type] || 1) - 1,
    );
    post.reactions[reactionDto.type] =
      (post.reactions[reactionDto.type] || 0) + 1;
    post.markModified('reactions');
    await post.save({ session });
  }

  private async handleExistingWithSameType(
    reactionId: Types.ObjectId,
    post: PostDocument,
    session: ClientSession,
  ) {
    const removedReaction = await this.reactionModel
      .findByIdAndDelete(reactionId)
      .session(session);
    if (!removedReaction)
      throw new BadRequestException('Failed to remove reaction');
    post.reactions[removedReaction.type] =
      post.reactions[removedReaction.type] - 1;
    if (post.reactions[removedReaction.type] === 0)
      delete post.reactions[removedReaction.type];
    post.markModified('reactions');
    await post.save({ session });
    return true;
  }

  private async handleNewReaction(
    reactionType: ReactionType,
    userId: Types.ObjectId,
    post: PostDocument,
    session: ClientSession,
  ) {
    const reaction: Reaction = {
      post: new Types.ObjectId(post._id),
      user: userId,
      type: reactionType,
    };
    await this.reactionModel.create([reaction], { session });
    post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    post.markModified('reactions');
    await post.save({ session });
    return true;
  }

  async findExistingReaction(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession,
  ) {
    const query = this.reactionModel.findOne({
      post: postId,
      user: userId,
    });
    if (session) {
      query.session(session);
    }
    return await query.lean();
  }
}
