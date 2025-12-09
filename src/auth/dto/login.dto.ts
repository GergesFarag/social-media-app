import { OmitType } from '@nestjs/mapped-types';
import { SignupDto } from './signup.dto';

export class LoginDto extends OmitType(SignupDto, ['username']) {}
