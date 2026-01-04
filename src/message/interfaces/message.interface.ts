import { Types } from 'mongoose';
import { MessageType } from '../types/message-type.enum';
import { MessageStatus } from '../types/message-status.enum';
import { IMessageReaction } from 'src/reaction/interfaces/reaction.interface';

export interface IMessage {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  type: MessageType;
  status: MessageStatus;
  readBy: Types.ObjectId[];
  replyTo: Types.ObjectId;
  isEdited: boolean;
  isDeleted: boolean;
  isSystem: boolean;
  react: IMessageReaction;
}
