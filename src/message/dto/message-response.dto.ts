import { Expose, Type } from 'class-transformer';
import { MessageType } from '../types/message-type.enum';
import { MessageStatus } from '../types/message-status.enum';
import { IPagination } from 'src/_core/interfaces/pagination.interface';

class SenderDto {
  @Expose()
  _id: string;

  @Expose()
  username: string;

  @Expose()
  avatar?: {
    url: string;
    public_id: string;
  };
}

class ReplyToDto {
  @Expose()
  _id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => SenderDto)
  sender: SenderDto;
}

export class MessageResponseDto {
  @Expose()
  _id: string;

  @Expose()
  conversation: string;

  @Expose()
  @Type(() => SenderDto)
  sender: SenderDto;

  @Expose()
  content: string;

  @Expose()
  type: MessageType;

  @Expose()
  status: MessageStatus;

  @Expose()
  readBy: string[];

  @Expose()
  @Type(() => ReplyToDto)
  replyTo?: ReplyToDto;

  @Expose()
  isEdited: boolean;

  @Expose()
  isSystem: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class CreateMessageResponseDto {
  @Expose()
  @Type(() => MessageResponseDto)
  data: MessageResponseDto;

  @Expose()
  status: 'success' | 'failure' = 'success';

  @Expose()
  message?: string = 'Message sent successfully';
}

export class MessagesListResponseDto {
  @Expose()
  @Type(() => MessageResponseDto)
  data: MessageResponseDto[];

  @Expose()
  meta: IPagination;

  @Expose()
  status: 'success' | 'failure' = 'success';
}
