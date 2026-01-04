import { Types } from 'mongoose';
import { ConversationType } from '../types/conversation-type.enum';
import { MediaType } from 'src/_core/interfaces/media.interface';

export interface IConversation {
  type: ConversationType;
  participants: Types.ObjectId[];
  lastMessage: Types.ObjectId;
  lastMessageAt: Date;
  isDeleted: boolean;
}
export interface IGroupConversation extends IConversation {
  name: string;
  admin: Types.ObjectId;
  avatar: MediaType;
}
