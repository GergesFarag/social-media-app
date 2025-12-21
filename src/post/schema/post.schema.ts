import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IPost } from '../interfaces/post.interface';
import { HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { PrivacyEnum } from 'src/_core/enums/privacy.enum';
import { Media } from '../interfaces/media.interface';
import { ReactionType } from 'src/reaction/types/reaction.type';

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

  @Prop({
    type: Object,
    default: {},
  })
  reactions: Record<ReactionType, number>;

  @Prop({
    type: Number,
    default: 0,
  })
  commentsCount: number;
}
export const PostSchema = SchemaFactory.createForClass(Post);
