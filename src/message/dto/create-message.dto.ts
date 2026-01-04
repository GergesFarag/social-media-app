import { MessageType } from '../types/message-type.enum';
import { Types } from 'mongoose';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  conversation: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  content: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsMongoId()
  @IsOptional()
  replyTo: Types.ObjectId;
}
