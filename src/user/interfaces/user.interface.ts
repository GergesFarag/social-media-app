import { MediaType } from 'src/_core/interfaces/media.interface';
import { RolesEnum } from '../../_core/enums/roles.enum';

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: RolesEnum;
  bio?: string;
  avatar?: MediaType;
  coverImage?: MediaType;
  phoneNumber?: string;
  birthdate?: Date;
  isDeleted?: boolean;
}
