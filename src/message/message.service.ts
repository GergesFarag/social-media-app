import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDoc } from './schema/message.schema';
import { Model, Types } from 'mongoose';
import { JwtPayload } from 'src/types/jwtPayload';
import { ConversationService } from 'src/conversation/conversation.service';
import { IQuery, sortingMap } from 'src/_core/interfaces/query.interface';
import { MessageStatus } from './types/message-status.enum';
import { MessageGateway } from './message.gateway';
import { plainToInstance } from 'class-transformer';
import { MessageResponseDto } from './dto/message-response.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private conversationService: ConversationService,
    private messageGateway: MessageGateway,
  ) {}

  async create(createMessageDto: CreateMessageDto, currentUser: JwtPayload) {
    await this.validateExistsingConv(
      currentUser,
      undefined,
      createMessageDto.conversation,
    );
    const message = await this.messageModel.create({
      ...createMessageDto,
      sender: currentUser.id,
    });

    await this.conversationService.updateLastMessage(message);
    const responseMessage = plainToInstance(MessageResponseDto, message, {
      excludeExtraneousValues: true,
    });
    this.messageGateway.sendMessageToConversation(
      message.conversation.toString(),
      responseMessage,
    );
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
    await this.validateExistsingConv(currentUser, messageId);
    const message = await this.messageModel.findOneAndUpdate(
      { _id: messageId, sender: currentUser.id },
      updateMessageDto,
    );
    const responseMessage = plainToInstance(MessageResponseDto, message, {
      excludeExtraneousValues: true,
    });
    this.messageGateway.updateMessage(
      message!.conversation.toString(),
      responseMessage,
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

  private async validateExistsingConv(
    currentUser: JwtPayload,
    messageId?: Types.ObjectId,
    convId?: Types.ObjectId,
  ) {
    let messageConvId: Types.ObjectId | undefined;
    if (!convId && messageId) {
      const message = await this.messageModel.findById(messageId);
      if (!message) throw new BadRequestException('Invalid message id');
      messageConvId = message.conversation;
    }
    const conv = await this.conversationService.findOne(
      convId ?? messageConvId!,
      currentUser,
    );
    if (!conv) throw new BadRequestException('invalid conversation id');
    return true;
  }
}
