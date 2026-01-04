import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schema/message.schema';
import { Model, Types } from 'mongoose';
import { JwtPayload } from 'src/types/jwtPayload';
import { ConversationService } from 'src/conversation/conversation.service';
import { IQuery, sortingMap } from 'src/_core/interfaces/query.interface';
import { MessageStatus } from './types/message-status.enum';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private conversationService: ConversationService,
  ) {}

  async create(createMessageDto: CreateMessageDto, currentUser: JwtPayload) {
    const message = await this.messageModel.create({
      ...createMessageDto,
      sender: currentUser.id,
    });
    await this.conversationService.updateLastMessage(message);
    return message;
  }

  async findByConversation(
    convId: Types.ObjectId,
    currentUser: JwtPayload,
    query: IQuery,
  ) {
    const { limit = 20, page = 1, sort = 'newest' } = query;
    await this.conversationService.findOne(convId, currentUser);
    const messages = await this.messageModel
      .find({ conversation: convId, isDeleted: false })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortingMap[sort]);
    return messages;
  }

  async update(
    messageId: Types.ObjectId,
    updateMessageDto: UpdateMessageDto,
    currentUser: JwtPayload,
  ) {
    const message = await this.messageModel.findOneAndUpdate(
      { _id: messageId, sender: currentUser.id },
      updateMessageDto,
    );
    if (!message) throw new UnauthorizedException('cannot upadte this message');
    return message;
  }

  async remove(messageId: Types.ObjectId, currentUser: JwtPayload) {
    const message = await this.messageModel.findOneAndUpdate(
      { _id: messageId, sender: currentUser.id },
      { isDeleted: true },
    );
    if (!message) throw new UnauthorizedException('cannot update this message');
    return message;
  }

  async markAsRead(convId: Types.ObjectId, currentUser: JwtPayload) {
    await this.messageModel.updateMany(
      {
        conversation: convId,
        readBy: { $ne: currentUser.id },
      },
      { $addToSet: { readBy: currentUser.id }, status: MessageStatus.READ },
    );
    return true;
  }
}
