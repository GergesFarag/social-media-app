import { Types } from 'mongoose';
import { RolesEnum } from '../_core/enums/roles.enum';

export type JwtPayload = {
  id: Types.ObjectId;
  email: string;
  role: RolesEnum;
};
