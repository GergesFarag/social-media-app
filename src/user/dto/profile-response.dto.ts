import { RolesEnum } from 'src/_core/enums/roles.enum';
import { IUser } from '../interfaces/user.interface';
import { Expose, Transform, Type } from 'class-transformer';
import { Media } from 'src/_core/interfaces/media.interface';
import { BaseDto } from 'src/_core/dto/base.dto';
import { Types } from 'mongoose';

export class UserProfileResponseDto extends BaseDto implements IUser {
  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  role: RolesEnum;

  @Expose()
  bio?: string;

  @Expose()
  @Transform(({ obj }) => obj?.avatar?.url)
  avatar?: Media | undefined;

  @Expose()
  @Transform(({ obj }) => obj?.coverImage?.url)
  coverImage?: Media | undefined;

  @Expose()
  phoneNumber?: string;

  @Expose()
  birthdate?: Date;

  @Expose()
  friends: Types.ObjectId[];

  @Expose()
  incomingFriendRequests: Types.ObjectId[];

  @Expose()
  outgoingFriendRequests: Types.ObjectId[];

  password: string;
  isDeleted?: boolean | undefined;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
}
