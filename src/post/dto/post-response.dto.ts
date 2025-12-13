import { PrivacyEnum } from 'src/_core/enums/privacy.enum';
import { UserDocument } from 'src/user/schemas/user.schema';
import { IPost } from '../interfaces/post.interface';
import { Expose, Transform } from 'class-transformer';
import { BaseDto } from 'src/_core/dto/base.dto';
import { PostDocument } from '../schema/post.schema';
import { Media } from '../interfaces/media.interface';

export class PostResponseDto extends BaseDto implements IPost {
  @Expose()
  content: string;
  @Expose()
  @Transform(({ obj }: { obj: PostDocument }) => obj.author._id.toString())
  author: UserDocument;
  @Expose()
  mediaUrls?: Media[];
  @Expose()
  privacySetting: PrivacyEnum;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
