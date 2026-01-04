import { Types } from 'mongoose';
import { FriendRequestStatus } from '../types/friend-request-status';

export interface FriendRequest {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: FriendRequestStatus;
}
