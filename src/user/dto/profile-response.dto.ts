import { RolesEnum } from 'src/_core/enums/roles.enum';
import { IUser } from '../interfaces/user.interface';
import { Expose, Transform, Type } from 'class-transformer';
import { Media, MediaType } from 'src/_core/interfaces/media.interface';
import { BaseDto } from 'src/_core/dto/base.dto';

export class UserProfileResponseDto extends BaseDto implements IUser {
  @Expose()
  username: string;
  @Expose()
  email: string;
  password: string;
  @Expose()
  role: RolesEnum;
  @Expose()
  bio?: string;
  @Expose()
  @Transform(({ obj }) => obj?.avatar?.url)
  @Expose()
  avatar?: Media | undefined;
  @Transform(({ obj }) => obj?.coverImage?.url)
  @Expose()
  coverImage?: Media | undefined;
  @Expose()
  phoneNumber?: string;
  @Expose()
  birthdate?: Date;
}
