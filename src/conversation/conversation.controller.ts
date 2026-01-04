import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CurrentUser } from 'src/_core/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwtPayload';
import { AuthGuard } from 'src/_core/guards/auth.guard';
import { Types } from 'mongoose';
import { ParseObjIdPipe } from 'src/_core/pipes/parse-obj-id.pipe';
import { IQuery } from 'src/_core/interfaces/query.interface';

@Controller('conversation')
@UseGuards(AuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  create(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.conversationService.create(createConversationDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: IQuery) {
    return this.conversationService.findAll(user, query);
  }

  @Get(':convId')
  findOne(
    @Param('convId', ParseObjIdPipe) convId: Types.ObjectId,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.conversationService.findOne(convId, user);
  }
}
