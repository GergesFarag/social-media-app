import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DirectStrategy } from './strategies/direct.strategy';
import { GroupStrategy } from './strategies/group.strategy';
import { IConversationStrategy } from './strategies/_conversation.strategy';
import { ConversationType } from './types/conversation-type.enum';
import { JwtPayload } from 'src/types/jwtPayload';
import { User } from 'src/user/schemas/user.schema';
import { Conversation, ConversationDoc } from './schema/conversation.schema';
import { IQuery, sortingMap } from 'src/_core/interfaces/query.interface';
import { PaginatedResponseDto } from 'src/_core/dto/response.dto';
import { Message, MessageDoc } from 'src/message/schema/message.schema';

@Injectable()
export class ConversationService {
  private strategies: Map<ConversationType, IConversationStrategy>;
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private directStrategy: DirectStrategy,
    private groupStrategy: GroupStrategy,
  ) {
    this.strategies = new Map<ConversationType, IConversationStrategy>([
      [ConversationType.DIRECT, this.directStrategy],
      [ConversationType.GROUP, this.groupStrategy],
    ]);
  }

  async create(
    createConversationDto: CreateConversationDto,
    currentUser: JwtPayload,
  ) {
    const strategy = this.getStartegy(createConversationDto.type);
    const participants = [
      ...new Set([currentUser.id, ...createConversationDto.participants]),
    ];
    if (!strategy.validateParticipants(participants)) {
      throw new BadRequestException(
        `Invalid participant count for ${createConversationDto.type} conversation`,
      );
    }
    const existingConv = await strategy.findExisting(participants);
    if (existingConv) return existingConv;
    const newConv = await strategy.buildCreatePayload(
      createConversationDto,
      participants,
      currentUser.id,
    );

    await this.userModel.findByIdAndUpdate(currentUser.id, {
      $addToSet: { conversations: newConv._id },
    });
    return newConv;
  }

  async findAll(
    currentUser: JwtPayload,
    query: IQuery,
  ): Promise<PaginatedResponseDto<ConversationDoc>> {
    const { limit = 15, page = 1, sort = 'newest' } = query;
    const user = await this.userModel
      .findById(currentUser.id, 'conversations')
      .sort(sortingMap[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate<{ conversations: ConversationDoc[] }>({
        path: 'conversations',
        select: 'type participants lastMessageAt name avatar admin',
        populate: {
          path: 'participants',
          select: 'avatar email username',
        },
      });
    const total: number = (
      await this.userModel.findById(currentUser.id, 'conversations')
    )?.conversations?.length as number;

    return {
      status: 'success',
      data: user?.conversations ?? [],
      meta: {
        limit,
        page,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(convId: Types.ObjectId, currentUser: JwtPayload) {
    const conv = await this.conversationModel.findById(convId);
    if (!conv?.participants.includes(currentUser.id)) {
      throw new ForbiddenException('Cannot get this conversation');
    }
    return conv.populate({
      path: 'participants',
      select: 'username _id avatar',
    });
  }

  async findOrCreateDirect(userId: Types.ObjectId, currentUser: JwtPayload) {
    const participants = [userId, currentUser.id];
    const conversaion = await this.conversationModel.findOne({
      type: ConversationType.DIRECT,
      participants: { $all: participants },
    });
    if (conversaion) return conversaion;
    const createdConv = await this.conversationModel.create({
      type: ConversationType.DIRECT,
      participants,
    });
    return createdConv;
  }

  async addPartcipant(
    convId: Types.ObjectId,
    userId: Types.ObjectId,
    currentUser: JwtPayload,
  ) {
    const conversation = await this.conversationModel.findOneAndUpdate(
      {
        _id: convId,
        admin: currentUser.id,
      },
      { $addToSet: { participants: userId } },
    );
    if (!conversation) throw new BadRequestException('invalid data');
    return conversation;
  }

  async removeParicipant(
    convId: Types.ObjectId,
    userId: Types.ObjectId,
    currentUser: JwtPayload,
  ) {
    const conversation = await this.conversationModel.findOneAndUpdate(
      {
        _id: convId,
        admin: currentUser.id,
      },
      { $pull: { participants: userId } },
    );
    if (!conversation) throw new BadRequestException('invalid data');
    return conversation;
  }

  async leaveConversation(convId: Types.ObjectId, currentUser: JwtPayload) {
    const conversation = await this.conversationModel.findOneAndUpdate(
      {
        _id: convId,
        type: ConversationType.GROUP,
      },
      { $pull: { participants: currentUser.id } },
    );
    if (!conversation) throw new BadRequestException('invalid data');
    conversation.admin =
      conversation.participants[conversation.participants.length - 1];
    await conversation.save();
    return conversation;
  }

  async updateLastMessage(message: MessageDoc) {
    const conversation = await this.conversationModel.findByIdAndUpdate(
      message.conversation,
      {
        lastMessage: message._id,
        lastMessageAt: message.createdAt,
      },
    );
    if (!conversation) throw new BadRequestException('Invalid Conversation Id');
    return true;
  }

  private getStartegy(type: ConversationType) {
    return this.strategies.get(type)!;
  }
}
