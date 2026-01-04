import { Model, Types } from 'mongoose';
import { IConversationStrategy } from './_conversation.strategy';
import { Injectable } from '@nestjs/common';
import { Conversation } from '../schema/conversation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ConversationType } from '../types/conversation-type.enum';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@Injectable()
export class DirectStrategy implements IConversationStrategy {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}
  async findExisting(
    participants: Types.ObjectId[],
  ): Promise<Conversation | null> {
    const existing = await this.conversationModel.findOne({
      type: ConversationType.DIRECT,
      participants: { $all: participants, $size: 2 },
    });
    if (existing) return existing;
    return null;
  }
  async buildCreatePayload(
    createConversationDto: CreateConversationDto,
    participants: Types.ObjectId[],
  ) {
    this.validateParticipants(participants);
    const newConv = new this.conversationModel({
      type: createConversationDto.type,
      participants: participants,
      name: createConversationDto.name,
    });
    await newConv.save();
    return newConv;
  }
  validateParticipants(participants: Types.ObjectId[]): boolean {
    return participants.length === 2;
  }
  getMaxParticipants(): number {
    return 2;
  }
  canAddParticipant(): boolean {
    return false;
  }
  canRemoveParticipant(): boolean {
    return true;
  }
}
