import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayload } from 'src/types/jwtPayload';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schemas/user.schema';
import { FriendRequest } from './schema/friend.schema';
import { FriendRequestStatus } from './types/friend-request-status';
import { PaginatedResponseDto } from 'src/_core/dto/response.dto';
import { IQuery, sortingMap } from 'src/_core/interfaces/query.interface';
import { FriendListResponseDto } from './dto/friend-list-response.dto';

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(FriendRequest.name)
    private friendRequestModel: Model<FriendRequest>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async sendFriendRequest(user: JwtPayload, receiverId: Types.ObjectId) {
    this.validateSelfFriendRequest(user.id, receiverId);
    await this.validateUserExists(receiverId);
    await this.validateNoPendingRequest(user.id, receiverId);
    await this.validateNotAlreadyFriends(user.id, receiverId);

    const friendRequest = await this.friendRequestModel.create({
      sender: user.id,
      receiver: receiverId,
      status: FriendRequestStatus.PENDING,
    });
    await friendRequest.populate([
      { path: 'sender', select: 'username email' },
      { path: 'receiver', select: 'username email' },
    ]);
    return friendRequest;
  }

  async cancelFriendRequest(user: JwtPayload, receiverId: Types.ObjectId) {
    const request = await this.validatePendingRequest(user.id, receiverId);
    await this.friendRequestModel.findByIdAndUpdate(request._id, {
      status: FriendRequestStatus.CANCELLED,
    });
    return { message: 'Friend request cancelled successfully' };
  }

  async confirmFriendRequest(user: JwtPayload, requesterId: Types.ObjectId) {
    const request = await this.validatePendingRequest(requesterId, user.id);
    const session = await this.friendRequestModel.db.startSession();
    session.startTransaction();
    try {
      await this.friendRequestModel.findByIdAndUpdate(
        request._id,
        {
          status: FriendRequestStatus.ACCEPTED,
        },
        { session },
      );
      await Promise.all([
        this.userModel.findByIdAndUpdate(
          user.id,
          {
            $addToSet: { friends: requesterId },
          },
          { session },
        ),
        this.userModel.findByIdAndUpdate(
          requesterId,
          {
            $addToSet: { friends: user.id },
          },
          { session },
        ),
      ]);
      await session.commitTransaction();
      return { message: 'Friend request confirmed successfully' };
    } catch {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Failed to confirm friend request',
      );
    } finally {
      await session.endSession();
    }
  }

  async rejectFriendRequest(user: JwtPayload, requesterId: Types.ObjectId) {
    const request = await this.validatePendingRequest(requesterId, user.id);

    await this.friendRequestModel.findByIdAndUpdate(request._id, {
      status: FriendRequestStatus.REJECTED,
    });

    return { message: 'Friend request rejected' };
  }

  async findIncomingRequests(
    user: JwtPayload,
    query: IQuery,
  ): Promise<PaginatedResponseDto<FriendRequest>> {
    const { limit = 10, page = 1, sort = 'newest' } = query;
    const [requests, total] = await Promise.all([
      this.friendRequestModel
        .find({
          receiver: user.id,
          status: FriendRequestStatus.PENDING,
        })
        .populate('sender', 'username email avatar')
        .populate('receiver', 'username email')
        .sort(sortingMap[sort])
        .skip((page - 1) * limit)
        .limit(limit),
      this.friendRequestModel.countDocuments({
        receiver: user.id,
        status: FriendRequestStatus.PENDING,
      }),
    ]);

    return {
      status: 'success',
      data: requests,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOutgoingRequests(
    user: JwtPayload,
    query: IQuery,
  ): Promise<PaginatedResponseDto<FriendRequest>> {
    const { limit = 10, page = 1, sort = 'newest' } = query;
    const [requests, total] = await Promise.all([
      this.friendRequestModel
        .find({
          sender: user.id,
          status: FriendRequestStatus.PENDING,
        })
        .populate('sender', 'username email avatar')
        .populate('receiver', 'username email')
        .sort(sortingMap[sort])
        .skip((page - 1) * limit)
        .limit(limit),
      this.friendRequestModel.countDocuments({
        receiver: user.id,
        status: FriendRequestStatus.PENDING,
      }),
    ]);

    return {
      status: 'success',
      data: requests,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFriends(
    user: JwtPayload,
    query: IQuery,
  ): Promise<FriendListResponseDto> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const user_doc = await this.userModel.findById(user.id);
    if (!user_doc) throw new NotFoundException('No User Found!');

    const totalFriends = user_doc.friends.length;

    const me = await this.userModel.findById(user.id).populate({
      path: 'friends',
      select: 'username email avatar',
      options: {
        skip,
        limit,
      },
    });
    if (!me) throw new NotFoundException('No User Found!');

    return {
      friends: me.friends,
      total: totalFriends,
    };
  }

  async unfriend(user: JwtPayload, friendId: Types.ObjectId) {
    const areFriends = await this.areFriends(user.id, friendId);
    if (!areFriends)
      throw new ConflictException('Cannot remove non-friend user');
    const session = await this.friendRequestModel.db.startSession();
    session.startTransaction();
    try {
      await Promise.all([
        this.userModel.findByIdAndUpdate(
          user.id,
          { $pull: { friends: friendId } },
          { session },
        ),
        this.userModel.findByIdAndUpdate(
          friendId,
          { $pull: { friends: user.id } },
          { session },
        ),
      ]);

      await session.commitTransaction();
      return { message: 'Friend removed successfully' };
    } catch {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to remove friend');
    } finally {
      await session.endSession();
    }
  }

  //* HELPERS *//

  private async validateUserExists(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found!');
    }
    return user;
  }

  private async validateNoPendingRequest(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,
  ) {
    const existing = await this.friendRequestModel.findOne({
      $or: [
        {
          sender: senderId,
          receiver: receiverId,
          status: FriendRequestStatus.PENDING,
        },
        {
          sender: receiverId,
          receiver: senderId,
          status: FriendRequestStatus.PENDING,
        },
      ],
    });
    if (existing)
      throw new ConflictException('A pending friend request exists');
  }

  private async validateNotAlreadyFriends(
    userId: Types.ObjectId,
    friendId: Types.ObjectId,
  ) {
    const user = await this.userModel.findById(userId);
    if (user?.friends.includes(friendId)) {
      throw new ConflictException('Already friends with this user');
    }
  }

  private async validatePendingRequest(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,
  ) {
    const request = await this.friendRequestModel.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    return request;
  }

  private validateSelfFriendRequest(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,
  ) {
    if (senderId.toString() === receiverId.toString()) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }
  }

  private async areFriends(userId: Types.ObjectId, friendId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user.friends.includes(friendId) ? true : false;
  }
}
