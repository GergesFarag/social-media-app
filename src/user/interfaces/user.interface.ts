import { MediaType } from 'src/_core/interfaces/media.interface';
import { RolesEnum } from '../../_core/enums/roles.enum';
import { Types } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: RolesEnum;
  friends: Types.ObjectId[];
  bio?: string;
  conversaions?: Types.ObjectId[];
  avatar?: MediaType;
  coverImage?: MediaType;
  phoneNumber?: string;
  birthdate?: Date;
  isDeleted?: boolean;
}
