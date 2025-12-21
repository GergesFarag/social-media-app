import { PrivacyEnum } from 'src/_core/enums/privacy.enum';
import { UserDocument } from 'src/user/schemas/user.schema';
import { IPost } from '../interfaces/post.interface';
import { Expose, Transform } from 'class-transformer';
import { BaseDto } from 'src/_core/dto/base.dto';
import { PostDocument } from '../schema/post.schema';
import { Media } from '../../_core/interfaces/media.interface';
import { ReactionType } from 'src/reaction/types/reaction.type';

export class PostResponseDto extends BaseDto implements IPost {
  @Expose()
  content: string;

  @Expose()
  @Transform(({ obj }: { obj: PostDocument }) => obj.author._id.toString())
  author: UserDocument;

  @Expose()
  privacySetting: PrivacyEnum;

  @Expose()
  mediaUrls?: Media[];

  @Expose()
  reactions: Record<ReactionType, number>;

  @Expose()
  myReaction: ReactionType;

  @Expose()
  commentsCount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
