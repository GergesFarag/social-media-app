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
import { AuthGuard } from 'src/_core/guards/auth.guard';
import { CurrentUser } from 'src/_core/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwtPayload';
import { ParseObjIdPipe } from 'src/_core/pipes/parse-obj-id.pipe';
import { Types } from 'mongoose';
import { IQuery } from 'src/_core/interfaces/query.interface';

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

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}
}
