import { ConversationType } from '../types/conversation-type.enum';
import { Types } from 'mongoose';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateConversationDto {
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsArray()
  @IsMongoId({ each: true })
  participants: Types.ObjectId[];

  @IsString()
  @IsOptional()
  name?: string;
}
