import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { ISignup } from '../interfaces/signup.interface';
import { Expose } from 'class-transformer';

export class SignupDto implements ISignup {
  @IsString()
  @Length(3)
  @IsNotEmpty()
  @Expose()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
