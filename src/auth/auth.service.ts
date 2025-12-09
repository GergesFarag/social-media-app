import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async signup(dto: SignupDto) {
    const user = new this.userModel(dto);
    const response = await user.save();
    return response;
  }

  async login(dto: LoginDto) {
    const existsUser = await this.userModel.findOne({ email: dto.email });
    if (!existsUser) {
      throw new BadRequestException('Invalid Credentials');
    }
    const isMatches = this.validatePassword(dto.password, existsUser.password);
    if (!isMatches) {
      throw new BadRequestException('Invalid Credentials');
    }
    return true;
  }

  private validatePassword(inputPass: string, userPass: string) {
    return inputPass === userPass;
  }
}
