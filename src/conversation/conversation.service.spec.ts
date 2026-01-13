import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Conversation } from './schema/conversation.schema';
import { DirectStrategy } from './strategies/direct.strategy';
import { GroupStrategy } from './strategies/group.strategy';
import { ConversationType } from './types/conversation-type.enum';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Types } from 'mongoose';
import { JwtPayload } from 'src/types/jwtPayload';
import { RolesEnum } from 'src/_core/enums/roles.enum';
import { Message, MessageDoc } from 'src/message/schema/message.schema';
import { MessageType } from 'src/message/types/message-type.enum';
import { MessageStatus } from 'src/message/types/message-status.enum';

describe('ConversationService', () => {
  let service: ConversationService;
  const mockUserModel = {
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
  };

  const mockConversationModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockDirectStrategy = {
    validateParticipants: jest.fn(),
    buildCreatePayload: jest.fn(),
    findExisting: jest.fn(),
  };

  const mockGroupStrategy = {
    validateParticipants: jest.fn(),
    buildCreatePayload: jest.fn(),
    findExisting: jest.fn(),
  };

  const mockMessageModel = {
    findById: jest.fn(),
  };

  const mockUser: JwtPayload = {
    email: 'test@gamil.com',
    id: new Types.ObjectId(),
    role: RolesEnum.USER,
  };

  const strategies = new Map<ConversationType, any>([
    [ConversationType.DIRECT, mockDirectStrategy],
    [ConversationType.GROUP, mockGroupStrategy],
  ]);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Conversation.name),
          useValue: mockConversationModel,
        },
        {
          provide: DirectStrategy,
          useValue: mockDirectStrategy,
        },
        {
          provide: GroupStrategy,
          useValue: mockGroupStrategy,
        },
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
      ],
    }).compile();

    jest.clearAllMocks();
    service = module.get<ConversationService>(ConversationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mockConversationModel).toBeDefined();
    expect(mockUserModel).toBeDefined();
    expect(mockGroupStrategy).toBeDefined();
    expect(mockDirectStrategy).toBeDefined();
  });

  describe('createConversation', () => {
    const mockUser: JwtPayload = {
      email: 'mockEmail@gmail.com',
      id: new Types.ObjectId(),
      role: RolesEnum.USER,
    };
    const convId = new Types.ObjectId();

    it('should create a converation with the direct type', async () => {
      const createConvDto: CreateConversationDto = {
        participants: [new Types.ObjectId()],
        type: ConversationType.DIRECT,
      };
      const expectedParticipants = [mockUser.id, ...createConvDto.participants];
      mockDirectStrategy.validateParticipants.mockReturnValue(true);
      mockDirectStrategy.findExisting.mockResolvedValue(null);
      mockDirectStrategy.buildCreatePayload.mockResolvedValue({
        _id: convId,
      });

      mockUserModel.findByIdAndUpdate.mockResolvedValue(undefined);

      const createdConv = await service.create(createConvDto, mockUser);

      expect(mockDirectStrategy.validateParticipants).toHaveBeenCalledWith(
        expectedParticipants,
      );
      expect(mockDirectStrategy.findExisting).toHaveBeenCalledWith(
        expectedParticipants,
      );
      expect(mockDirectStrategy.buildCreatePayload).toHaveBeenCalledWith(
        createConvDto,
        expectedParticipants,
        mockUser.id,
      );
      expect(createdConv).toHaveProperty('_id', convId);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser.id,
        {
          $addToSet: { conversations: convId },
        },
      );
    });

    it('should create a conversation with the group type', async () => {
      const createConvDto: CreateConversationDto = {
        participants: [
          new Types.ObjectId(),
          new Types.ObjectId(),
          new Types.ObjectId(),
        ],
        type: ConversationType.GROUP,
        name: 'The Ghosts',
      };
      const expectedParticipants = [mockUser.id, ...createConvDto.participants];
      mockGroupStrategy.validateParticipants.mockReturnValue(true);
      mockGroupStrategy.findExisting.mockResolvedValue(null);
      mockGroupStrategy.buildCreatePayload.mockResolvedValue({
        _id: convId,
        name: 'The Ghosts',
        participants: expectedParticipants,
      });

      mockUserModel.findByIdAndUpdate.mockResolvedValue(undefined);

      const createdConv = await service.create(createConvDto, mockUser);

      expect(mockGroupStrategy.validateParticipants).toHaveBeenCalledWith(
        expectedParticipants,
      );
      expect(mockGroupStrategy.findExisting).toHaveBeenCalledWith(
        expectedParticipants,
      );
      expect(mockGroupStrategy.buildCreatePayload).toHaveBeenCalledWith(
        createConvDto,
        expectedParticipants,
        mockUser.id,
      );
      expect(mockDirectStrategy.validateParticipants).not.toHaveBeenCalled();
      expect(createdConv).toMatchObject({
        _id: convId,
        name: 'The Ghosts',
        participants: expectedParticipants,
      });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser.id,
        {
          $addToSet: { conversations: convId },
        },
      );
    });
  });

  describe('getStrategy', () => {
    it('should return the direct strategy service', () => {
      const direct = ConversationType.DIRECT;

      const strategy = service.getStartegy(direct);

      expect(strategy).toBe(strategies.get(direct));
    });
  });

  describe('updateLastMessage', () => {
    const conversation = {
      _id: new Types.ObjectId(),
      type: ConversationType.DIRECT,
      isDeleted: false,
      lastMessage: new Types.ObjectId(),
      participants: [mockUser.id, new Types.ObjectId()],
    };
    const newLastMessageId = new Types.ObjectId();
    it('should update the conversation with the last message', async () => {
      const newLastMessage = {
        _id: newLastMessageId,
        conversation: conversation._id,
        createdAt: new Date(),
      };
      mockMessageModel.findById.mockResolvedValue(newLastMessage);
      mockConversationModel.findByIdAndUpdate.mockResolvedValue({
        ...conversation,
        lastMessage: newLastMessage,
      });

      const isUpdated = await service.updateLastMessage(newLastMessage._id);
      expect(mockMessageModel.findById).toHaveBeenCalledTimes(1);
      expect(mockMessageModel.findById).toHaveBeenCalledWith(
        newLastMessage._id,
      );
      expect(mockConversationModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(mockConversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        newLastMessage.conversation,
        {
          lastMessage: newLastMessage._id,
          lastMessageAt: newLastMessage.createdAt,
        },
      );
      expect(isUpdated).toBeTruthy();
    });
  });
});
