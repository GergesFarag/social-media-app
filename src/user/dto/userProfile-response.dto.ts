import { RolesEnum } from 'src/_core/enums/roles.enum';
import { IUser } from '../interfaces/user.interface';
import { Expose } from 'class-transformer';

export class UserProfileResponseDto implements IUser {
  @Expose()
  username: string;
  @Expose()
  email: string;
  password: string;
  @Expose()
  role: RolesEnum;
}
