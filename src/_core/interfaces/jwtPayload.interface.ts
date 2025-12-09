import { RolesEnum } from '../enums/roles.enum';

export interface JWTPayload {
  id: string;
  email: string;
  role: RolesEnum;
}
