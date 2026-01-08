import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AuthGuard } from '../_core/guards/auth.guard';
import { CurrentUser } from '../_core/decorators/current-user.decorator';
import { JwtPayload } from '../types/jwtPayload';
import { ParseObjIdPipe } from '../_core/pipes/parse-obj-id.pipe';
import { Types } from 'mongoose';
import { IQuery } from '../_core/interfaces/query.interface';

@Controller('message')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.messageService.create(createMessageDto, currentUser);
  }

  @Get(':convId')
  findAll(
    @CurrentUser() user: JwtPayload,
    @Param('convId', ParseObjIdPipe) convId: Types.ObjectId,
    @Query() queryDto: IQuery,
  ) {
    return this.messageService.findByConversation(convId, user, queryDto);
  }

  @Patch(':convId/read')
  markAsRead(
    @Param('convId', ParseObjIdPipe) convId: Types.ObjectId,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.messageService.markAsRead(convId, currentUser);
  }

  @Patch(':messageId')
  update(
    @Param('messageId', ParseObjIdPipe) messageId: Types.ObjectId,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.messageService.update(messageId, updateMessageDto, currentUser);
  }

  @Delete(':messageId')
  remove(
    @Param('messageId', ParseObjIdPipe) messageId: Types.ObjectId,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.messageService.remove(messageId, currentUser);
  }
}
