import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { FriendRequestStatus } from '../types/friend-request-status';

@Schema({ timestamps: true })
export class FriendRequest {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  sender: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  receiver: Types.ObjectId;
  @Prop({
    type: String,
    enum: Object.values(FriendRequestStatus),
    default: FriendRequestStatus.PENDING,
    index: true,
  })
  status: FriendRequestStatus;
}
export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);

FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
FriendRequestSchema.index({ receiver: 1, status: 1 });
FriendRequestSchema.index({ sender: 1, status: 1 });
