import { OmitType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends OmitType(CreateMessageDto, [
  'conversation',
  'replyTo',
  'type',
]) {}
