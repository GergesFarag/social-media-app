import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BcryptService } from '../_core/services/bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private bcryptService: BcryptService,
  ) {}
  async signup(dto: SignupDto) {
    const isExists = await this.userModel.findOne({ email: dto.email });
    if (isExists) {
      throw new BadRequestException('Cannot use these credentials');
    }
    const newUser = {
      ...dto,
      password: await this.bcryptService.hash(dto.password),
    };
    const user = new this.userModel(newUser);
    const response = await user.save();
    return response;
  }

  async login(dto: LoginDto) {
    const existsUser = await this.userModel.findOne({ email: dto.email });
    if (!existsUser) {
      throw new BadRequestException('Invalid Credentials');
    }
    const isMatches = await this.validatePassword(
      dto.password,
      existsUser.password,
    );
    if (!isMatches) {
      throw new BadRequestException('Invalid Credentials');
    }
    return true;
  }

  private async validatePassword(inputPass: string, userPass: string) {
    return this.bcryptService.compare(inputPass, userPass);
  }
}
