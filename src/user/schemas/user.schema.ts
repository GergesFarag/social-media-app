import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '../interfaces/user.interface';
import { RolesEnum } from '../../_core/enums/roles.enum';
import { HydratedDocument } from 'mongoose';
import { MediaType } from 'src/_core/interfaces/media.interface';
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

  @Prop({
    type: String,
  })
  bio?: string;

  @Prop({
    type: {
      url: String,
      version: Number,
      public_id: String,
      display_name: String,
      format: String,
      resource_type: String,
    },
  })
  avatar?: MediaType;

  @Prop({
    type: {
      url: String,
      version: Number,
      public_id: String,
      display_name: String,
      format: String,
      resource_type: String,
    },
  })
  coverImage?: MediaType;

  @Prop({
    type: String,
  })
  phoneNumber?: string;

  @Prop({
    type: String,
  })
  birthdate?: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);
