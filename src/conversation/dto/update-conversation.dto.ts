import { OmitType } from '@nestjs/mapped-types';
import { CreateConversationDto } from './create-conversation.dto';

export class UpdateConversationDto extends OmitType(CreateConversationDto, [
  'type',
]) {}
