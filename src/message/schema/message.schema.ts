import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IMessage } from '../interfaces/message.interface';
import { IMessageReaction } from 'src/reaction/interfaces/reaction.interface';
import { MessageStatus } from '../types/message-status.enum';
import { MessageType } from '../types/message-type.enum';
import { MessageReactionSchema } from 'src/reaction/schema/reaction.schema';

export type MessageDoc = HydratedDocument<Message>;
@Schema()
export class Message implements IMessage {
  @Prop({
    type: Types.ObjectId,
    ref: 'Conversation', // Use string to avoid circular dependency
  })
  conversation: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  sender: Types.ObjectId;

  @Prop({
    type: String,
  })
  content: string;

  @Prop({
    type: String,
    enum: MessageType,
  })
  type: MessageType;

  @Prop({
    type: String,
    enum: MessageStatus,
  })
  status: MessageStatus;

  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
  })
  readBy: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Message',
  })
  replyTo: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isEdited: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Boolean, default: false })
  isSystem: boolean;

  @Prop({ type: MessageReactionSchema })
  react: IMessageReaction;

  @Prop({
    type: Date,
    default: Date.now(),
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: Date.now(),
  })
  UpdatedAt: Date;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
