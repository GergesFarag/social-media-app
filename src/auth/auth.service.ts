import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BcryptService } from '../_core/services/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/types/jwtPayload';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
  ) {}
  async signup(dto: SignupDto): Promise<LoginResponseDto> {
    const isExists = await this.userModel.findOne({
      email: dto.email,
      isDeleted: false,
    });
    if (isExists) {
      throw new BadRequestException('Cannot use these credentials');
    }
    const newUser = {
      ...dto,
      password: await this.bcryptService.hash(dto.password),
    };
    const user = new this.userModel(newUser);
    const response = await user.save();
    const JWTPayload: JwtPayload = {
      id: response._id,
      email: response.email,
      role: response.role,
    };
    const JWT = this.jwtService.sign(JWTPayload);
    return { accessToken: JWT };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const existsUser = await this.userModel.findOne({
      email: dto.email,
      isDeleted: false,
    });
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
    const JWTPayload: JwtPayload = {
      id: existsUser._id,
      email: existsUser.email,
      role: existsUser.role,
    };
    const JWT = this.jwtService.sign(JWTPayload);
    return { accessToken: JWT };
  }

  private async validatePassword(inputPass: string, userPass: string) {
    return this.bcryptService.compare(inputPass, userPass);
  }
}
