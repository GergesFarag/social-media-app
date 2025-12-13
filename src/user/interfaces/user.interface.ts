import { RolesEnum } from '../../_core/enums/roles.enum';

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: RolesEnum;
}
