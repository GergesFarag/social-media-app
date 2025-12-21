import { User } from 'src/user/schemas/user.schema';
import { IReaction } from '../interfaces/reaction.interface';
import { reactions, ReactionType } from '../types/reaction.type';
import { Post } from 'src/post/schema/post.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type ReactionDocument = HydratedDocument<Reaction>;

@Schema()
export class Reaction implements IReaction {
  @Prop({
    type: String,
    enum: reactions,
    default: 'LIKE',
  })
  type: ReactionType;
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: Post.name })
  post: Types.ObjectId;
}
export const ReactionSchema = SchemaFactory.createForClass(Reaction);
