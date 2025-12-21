import { BaseDto } from 'src/_core/dto/base.dto';
import { IComment } from '../interfaces/commnet.interface';
import { Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';

export class CommentResponseDto extends BaseDto implements IComment {
  @Expose()
  @Transform(({ obj }) => obj.post?.toString())
  post: Types.ObjectId;

  @Expose()
  @Transform(({ obj }) => {
    if (obj.author && typeof obj.author === 'object') {
      return {
        _id: obj.author._id?.toString() || obj.author.id?.toString(),
        username: obj.author.username,
      };
    }
    return obj.author?.toString();
  })
  author: any;

  @Expose()
  content: string;

  @Expose()
  @Transform(({ obj }) => obj.parentComment?.toString() || null)
  parentComment: Types.ObjectId | null;

  @Expose()
  @Transform(({ obj }) => obj.rootComment?.toString() || null)
  rootComment: Types.ObjectId | null;

  @Expose()
  levels: number;

  @Expose()
  repliesCount: number;

  @Expose()
  likesCount: number;

  @Expose()
  isDeleted: boolean;

  @Expose()
  deletedReason?: string | undefined;

  @Expose()
  isEdited: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
