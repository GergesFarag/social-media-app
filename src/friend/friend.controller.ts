import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { CurrentUser } from 'src/_core/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwtPayload';
import { ParseObjIdPipe } from 'src/_core/pipes/parse-obj-id.pipe';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/_core/guards/auth.guard';
import { IQuery } from 'src/_core/interfaces/query.interface';
import { TransformResponse } from 'src/_core/decorators/transform-response.decorator';
import { FriendRequestResponseDto } from './dto/friend-request-response.dto';
import { PaginatedResponseDto } from 'src/_core/dto/response.dto';
import { FriendRequest } from './schema/friend.schema';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  getFriends(@CurrentUser() user: JwtPayload, @Query() query: IQuery) {
    return this.friendService.getFriends(user, query);
  }

  @Post('requests/:receiverId')
  @TransformResponse(FriendRequestResponseDto)
  createRequest(
    @CurrentUser() user: JwtPayload,
    @Param('receiverId', ParseObjIdPipe) receiverId: Types.ObjectId,
  ) {
    return this.friendService.sendFriendRequest(user, receiverId);
  }

  @Delete('requests/:receiverId')
  removeRequest(
    @CurrentUser() user: JwtPayload,
    @Param('receiverId', ParseObjIdPipe) receiverId: Types.ObjectId,
  ) {
    return this.friendService.cancelFriendRequest(user, receiverId);
  }

  @Patch('requests/:requesterId/confirm')
  confirmRequest(
    @CurrentUser() user: JwtPayload,
    @Param('requesterId', ParseObjIdPipe) requesterId: Types.ObjectId,
  ) {
    return this.friendService.confirmFriendRequest(user, requesterId);
  }

  @Patch('requests/:requesterId/reject')
  rejectRequest(
    @CurrentUser() user: JwtPayload,
    @Param('requesterId', ParseObjIdPipe) requesterId: Types.ObjectId,
  ) {
    return this.friendService.rejectFriendRequest(user, requesterId);
  }

  @Get('requests/incoming')
  @TransformResponse(PaginatedResponseDto<FriendRequest>)
  getIncomingRequests(@CurrentUser() user: JwtPayload, @Query() query: IQuery) {
    return this.friendService.findIncomingRequests(user, query);
  }

  @Get('requests/outgoing')
  @TransformResponse(PaginatedResponseDto<FriendRequest>)
  getOutgoingRequests(@CurrentUser() user: JwtPayload, @Query() query: IQuery) {
    return this.friendService.findOutgoingRequests(user, query);
  }

  @Delete(':friendId')
  unfriend(
    @CurrentUser() user: JwtPayload,
    @Param('friendId', ParseObjIdPipe) friendId: Types.ObjectId,
  ) {
    return this.friendService.unfriend(user, friendId);
  }
}
