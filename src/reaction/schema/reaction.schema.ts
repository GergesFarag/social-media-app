import { IMessageReaction, IReaction } from '../interfaces/reaction.interface';
import { reactions, ReactionType } from '../types/reaction.type';
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
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Post' })
  post: Types.ObjectId;
}
export const ReactionSchema = SchemaFactory.createForClass(Reaction);

@Schema()
export class MessageReaction implements IMessageReaction {
  @Prop({
    enum: ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'],
    type: String,
  })
  type: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';
  @Prop({
    type: Types.ObjectId,
    ref: 'user',
  })
  user: Types.ObjectId;
}
export const MessageReactionSchema =
  SchemaFactory.createForClass(MessageReaction);
