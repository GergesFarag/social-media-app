import { RolesEnum } from '../_core/enums/roles.enum';

export type JwtPayload = {
  id: string;
  email: string;
  role: RolesEnum;
};
