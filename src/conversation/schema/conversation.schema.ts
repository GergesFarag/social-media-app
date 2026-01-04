import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IConversation } from '../interfaces/conversation.interface';
import { ConversationType } from '../types/conversation-type.enum';
import { MediaType } from 'src/_core/interfaces/media.interface';

export type ConversationDoc = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation implements IConversation {
  @Prop({ type: String, enum: ConversationType })
  type: ConversationType;
  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
  })
  participants: Types.ObjectId[];
  @Prop({
    type: Types.ObjectId,
    ref: 'Message',
  })
  lastMessage: Types.ObjectId;
  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
  @Prop({ type: Date, default: Date.now() })
  lastMessageAt: Date;

  //Group Attrs
  @Prop({
    type: String,
  })
  name?: string;
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  admin?: Types.ObjectId;
  @Prop({
    type: {
      url: String,
      version: Number,
      public_id: String,
      display_name: String,
      format: String,
      resource_type: String,
    },
  })
  avatar?: MediaType;
}
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
