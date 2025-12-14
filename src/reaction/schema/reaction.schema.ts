import { User, UserDocument } from 'src/user/schemas/user.schema';
import { IReaction } from '../interfaces/reaction.interface';
import { reactions, ReactionType } from '../types/reaction.type';
import { Post, PostDocument } from 'src/post/schema/post.schema';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type ReactionDocument = HydratedDocument<Reaction>;
export class Reaction implements IReaction {
  @Prop({
    type: String,
    enum: reactions,
    default: 'LIKE',
  })
  type: ReactionType;
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: UserDocument;
  @Prop({ type: Types.ObjectId, ref: Post.name })
  post: PostDocument;
}
export const ReactionSchema = SchemaFactory.createForClass(Reaction);
