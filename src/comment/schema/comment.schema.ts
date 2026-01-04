import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  post: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: String, maxLength: 2000, required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentComment: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null, index: true })
  rootComment: Types.ObjectId | null;

  @Prop({ type: Number, default: 0, max: 5 })
  levels: number;

  @Prop({ type: Number, default: 0 })
  repliesCount: number;

  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: String, required: false })
  deletedReason?: string | undefined;

  @Prop({ type: Boolean, default: false })
  isEdited: boolean;
}
export const commentSchema = SchemaFactory.createForClass(Comment);

//Compound indexes for fast find and sorting
commentSchema.index({ post: 1, parentComment: 1, createdAt: -1 });
commentSchema.index({ post: 1, rootComment: 1 });
commentSchema.index({ author: 1, createdAt: -1 });
