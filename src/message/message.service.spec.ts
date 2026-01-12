import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from './schema/message.schema';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageGateway } from './message.gateway';
import { ObjectId, Types } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageType } from './types/message-type.enum';
import { JwtPayload } from 'src/types/jwtPayload';
import { RolesEnum } from 'src/_core/enums/roles.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageStatus } from './types/message-status.enum';
import { plainToInstance } from 'class-transformer';
import { MessageResponseDto } from './dto/message-response.dto';

describe('MessageService', () => {
  let service: MessageService;
  const mockMessageModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  };

  const mockConversationService = {
    findOne: jest.fn(),
    findById: jest.fn(),
    updateLastMessage: jest.fn(),
  };

  const mockMessageGateway = {
    sendMessage: jest.fn(),
    updateMessage: jest.fn(),
    deleteMessage: jest.fn(),
    markAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
        {
          provide: ConversationService,
          useValue: mockConversationService,
        },
        {
          provide: MessageGateway,
          useValue: mockMessageGateway,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  const mockUser: JwtPayload = {
    id: new Types.ObjectId(),
    role: RolesEnum.USER,
    email: 'test@gmail.com',
  };
  const convId = new Types.ObjectId();

  describe('create', () => {
    const convId = new Types.ObjectId();
    const createDto: CreateMessageDto = {
      conversation: convId,
      content: 'Hi there',
      type: MessageType.TEXT,
    };
    mockConversationService.findOne.mockResolvedValue({
      _id: convId,
    });
    it('should create a message', async () => {
      mockMessageModel.create.mockResolvedValue({
        ...createDto,
        _id: new Types.ObjectId(),
      });
      const result = await service.create(createDto, mockUser);
      expect(mockMessageModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should emit message via websocket after creation', async () => {
      const messageId = new Types.ObjectId();
      const createdMessage = {
        ...createDto,
        _id: messageId,
        sender: mockUser.id,
      };

      mockMessageModel.create.mockResolvedValue(createdMessage);
      mockConversationService.updateLastMessage.mockResolvedValue(undefined);

      await service.create(createDto, mockUser);

      expect(mockMessageGateway.sendMessage).toHaveBeenCalledWith(
        convId.toString(),
        expect.objectContaining({}),
      );
      expect(mockMessageGateway.sendMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByConversation', () => {
    const convId = new Types.ObjectId();
    const query = { limit: 20, page: 1, sort: 'newest' as const };

    it('should return existed messages', async () => {
      const mockMessages = [
        { _id: new Types.ObjectId(), content: 'Hello', conversation: convId },
      ];
      const mockResponse = {
        data: mockMessages,
        status: 'success',
        meta: {
          totalItems: 20,
          totalPages: 5,
          page: 1,
          limit: 10,
        },
      };
      mockConversationService.findOne.mockResolvedValue({ _id: convId });

      mockMessageModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockMessages),
          }),
        }),
      });
      const result = await service.findByConversation(convId, mockUser, query);
      expect(mockConversationService.findOne).toHaveBeenCalledWith(
        convId,
        mockUser,
      );
      expect(mockMessageModel.find).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result).toHaveProperty('status', 'success');
    });

    it('should return not found message', async () => {
      mockConversationService.findOne.mockRejectedValue(
        new NotFoundException('Invalid conv id'),
      );

      await expect(
        service.findByConversation(convId, mockUser, query),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const messageId = new Types.ObjectId();
    const mockUpdateMessageDto: UpdateMessageDto = {
      content: 'this is updated message',
    };

    it('should update the message', async () => {
      mockMessageModel.findById.mockResolvedValue({ _id: messageId });
      mockConversationService.findOne.mockResolvedValue({ _id: convId });
      mockMessageModel.findOneAndUpdate.mockResolvedValue({
        _id: messageId,
        content: 'this is updated message',
        conversation: convId,
      });

      const result = await service.update(
        messageId,
        mockUpdateMessageDto,
        mockUser,
      );

      expect(mockMessageModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should emit message via websocket after update', async () => {
      const updatedMessage = {
        _id: messageId,
        content: 'this is updated content',
        conversation: convId,
        sender: mockUser.id,
      };

      mockMessageModel.findById.mockResolvedValue({ _id: messageId });
      mockConversationService.findOne.mockResolvedValue({ _id: convId });
      mockMessageModel.findOneAndUpdate.mockResolvedValue(updatedMessage);

      await service.update(
        messageId,
        { content: 'this is updated content' },
        mockUser,
      );

      expect(mockMessageGateway.updateMessage).toHaveBeenCalledWith(
        convId.toString(),
        expect.objectContaining({}),
      );
      expect(mockMessageGateway.updateMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    const messageId = new Types.ObjectId();
    it('should mark the message as removed', async () => {
      mockMessageModel.findOneAndUpdate.mockResolvedValue({
        _id: messageId,
        conversation: convId,
        isDeleted: true,
      });
      const deletedMessage = await service.remove(messageId, mockUser);
      expect(mockMessageModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: messageId, sender: mockUser.id },
        { isDeleted: true },
        { new: true },
      );
      expect(deletedMessage).toBeDefined();
    });

    it('should emit message via websockets after removing', async () => {
      mockMessageModel.findOneAndUpdate.mockResolvedValue({
        _id: messageId,
        conversation: convId,
        isDeleted: true,
      });
      mockMessageGateway.deleteMessage.mockReturnValue(undefined);

      await service.remove(messageId, mockUser);

      expect(mockMessageGateway.deleteMessage).toHaveBeenCalledTimes(1);

      const [conversation, message] =
        mockMessageGateway.deleteMessage.mock.calls[0];

      expect(conversation).toBe(convId.toString());
      expect(message.isDeleted).toBe(true);
    });
  });

  describe('mark as seen', () => {
    const mockMessages = [
      {
        _id: new Types.ObjectId(),
        conversation: convId,
        readBy: [mockUser.id],
        content: 'hello Iam mock message',
        status: MessageStatus.READ,
      },
    ];
    it('should mark message as seen', async () => {
      mockMessageModel.updateMany.mockResolvedValue({ modifiedCount: 1 });
      mockMessageModel.find.mockResolvedValue(mockMessages);

      const isMarked = await service.markAsRead(convId, mockUser);

      expect(mockMessageModel.updateMany).toHaveBeenCalledWith(
        {
          conversation: convId,
          readBy: { $ne: mockUser.id },
        },
        {
          $addToSet: { readBy: mockUser.id },
          status: MessageStatus.READ,
        },
      );

      expect(mockMessageModel.find).toHaveBeenCalledWith({
        conversation: convId,
        readBy: mockUser.id,
      });
      expect(isMarked).toBeTruthy();
    });

    it('should emit message via websockets after mark messages as seen', async () => {
      mockMessageModel.updateMany.mockResolvedValue({ modifiedCount: 1 });
      mockMessageModel.find.mockResolvedValue(mockMessages);
      mockMessageGateway.markAsRead.mockReturnValue(undefined);

      await service.markAsRead(convId, mockUser);

      expect(mockMessageGateway.markAsRead).toHaveBeenCalledWith(
        convId.toString(),
        expect.arrayContaining([
          expect.objectContaining({
            content: 'hello Iam mock message',
          }),
        ]),
      );
      expect(mockMessageGateway.markAsRead).toHaveBeenCalledTimes(1);
    });
  });

  describe('validate existing conversation with convId', () => {
    it('should return true', async () => {
      mockConversationService.findOne.mockResolvedValue({ _id: convId });
      const exists = await service.validateExistsingConv(
        mockUser,
        undefined,
        convId,
      );
      expect(mockConversationService.findOne).toHaveBeenCalledWith(
        convId,
        mockUser,
      );
      expect(exists).toBeTruthy();
    });

    it('should throw Not Found', async () => {
      mockConversationService.findOne.mockResolvedValue(null);
      await expect(
        service.validateExistsingConv(mockUser, undefined, convId),
      ).rejects.toThrow(BadRequestException);
      expect(mockConversationService.findOne).toHaveBeenCalledWith(
        convId,
        mockUser,
      );
    });
  });
});
