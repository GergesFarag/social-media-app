import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '../interfaces/user.interface';
import { RolesEnum } from '../../_core/enums/roles.enum';
import { HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<User>;
@Schema()
export class User implements IUser {
  @Prop()
  username: string;
  @Prop({ unique: true })
  email: string;
  @Prop()
  password: string;
  @Prop({
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role: RolesEnum;
}
export const UserSchema = SchemaFactory.createForClass(User);
