import { Expose } from 'class-transformer';
import { FriendRequestStatus } from '../types/friend-request-status';

export class FriendRequestResponseDto {
  @Expose()
  id: string;
  @Expose()
  sender: {
    id: string;
    username: string;
    email: string;
  };

  @Expose()
  receiver: {
    id: string;
    username: string;
    email: string;
  };

  @Expose()
  status: FriendRequestStatus;
  @Expose()
  createdAt: Date;
}
