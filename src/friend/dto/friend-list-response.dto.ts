import { Expose } from 'class-transformer';
import { Types } from 'mongoose';

export class FriendListResponseDto {
  @Expose()
  friends: Types.ObjectId[];
  @Expose()
  total: number;
}
