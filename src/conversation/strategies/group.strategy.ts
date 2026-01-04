import { Model, Types } from 'mongoose';
import { IConversationStrategy } from './_conversation.strategy';
import { Injectable } from '@nestjs/common';
import { Conversation } from '../schema/conversation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateConversationDto } from '../dto/create-conversation.dto';
@Injectable()
export class GroupStrategy implements IConversationStrategy {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}
  findExisting(): null {
    return null;
  }
  async buildCreatePayload(
    createConversationDto: CreateConversationDto,
    participants: Types.ObjectId[],
    adminId: Types.ObjectId,
  ) {
    this.validateParticipants(participants);
    const newConv = new this.conversationModel({
      type: createConversationDto.type,
      participants: participants,
      name: createConversationDto.name,
      admin: adminId,
    });
    await newConv.save();
    return newConv;
  }
  validateParticipants(participants: Types.ObjectId[]): boolean {
    return participants.length >= 2 && participants.length <= 100;
  }
  getMaxParticipants(): number {
    return 100;
  }
  canAddParticipant(currentCount: number): boolean {
    return currentCount < 100 && currentCount > 1;
  }
  canRemoveParticipant(): boolean {
    return false;
  }
}
