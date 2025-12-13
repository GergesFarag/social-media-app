import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IPost } from '../interfaces/post.interface';
import { HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { PrivacyEnum } from 'src/_core/enums/privacy.enum';
import { Media } from '../interfaces/media.interface';

export type PostDocument = HydratedDocument<Post>;
@Schema({ timestamps: true })
export class Post implements IPost {
  @Prop()
  content: string;
  @Prop({ type: Types.ObjectId, ref: User.name })
  author: UserDocument;
  @Prop({ default: [] })
  mediaUrls: Media[];
  @Prop({
    default: PrivacyEnum.PUBLIC,
  })
  privacySetting: PrivacyEnum;
  @Prop({
    default: '#FFFFFF',
  })
  backgroundColor?: string;
}
export const PostSchema = SchemaFactory.createForClass(Post);
