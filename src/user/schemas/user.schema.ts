import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '../interfaces/user.interface';
import { RolesEnum } from '../../_core/enums/roles.enum';

@Schema()
export class User implements IUser  {
  @Prop()
  username: string;
  @Prop()
  email: string;
  @Prop()
  password: string;
  @Prop({
    default: RolesEnum.USER,
  })
  role: RolesEnum;
}
export const UserSchema = SchemaFactory.createForClass(User);
