import { Types } from 'mongoose';
import { Conversation, ConversationDoc } from '../schema/conversation.schema';
import { CreateConversationDto } from '../dto/create-conversation.dto';

export interface IConversationStrategy {
  validateParticipants(participants: Types.ObjectId[]): boolean;
  getMaxParticipants(): number;
  canAddParticipant(currentCount?: number): boolean;
  canRemoveParticipant(): boolean;
  findExisting(
    participants: Types.ObjectId[],
  ): Promise<Conversation | null> | null;
  buildCreatePayload(
    createConversationDto: CreateConversationDto,
    participants: Types.ObjectId[],
    adminId: Types.ObjectId,
  ): Promise<ConversationDoc>;
}
