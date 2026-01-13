import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BcryptService } from '../_core/services/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/types/jwtPayload';
import { LoginResponseDto } from './dto/login-response.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
    private mailService: MailService,
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
    await user.save();
    await this.handleNonVerifiedEmail(user);
    return { message: 'Verification email sent successfully' };
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
    const isVerifiedEmail = this.validateVerifiedEmail(existsUser);
    if (isVerifiedEmail) {
      const JWTPayload: JwtPayload = {
        id: existsUser._id,
        email: existsUser.email,
        role: existsUser.role,
      };
      const JWT = this.jwtService.sign(JWTPayload);
      return { message: 'Logged in successfully', accessToken: JWT };
    }
    await this.handleNonVerifiedEmail(existsUser);
    return { message: 'Verification email sent successfully' };
  }

  async verifyEmail(token: string) {
    try {
      await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
    const updatedUser = await this.userModel.findOneAndUpdate(
      {
        emailVerificationToken: token,
        isEmailVerified: false,
      },
      {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
      { new: true },
    );
    if (!updatedUser) {
      throw new BadRequestException('Invalid token or already verified');
    }
    return true;
  }

  private async validatePassword(inputPass: string, userPass: string) {
    return this.bcryptService.compare(inputPass, userPass);
  }

  private validateVerifiedEmail(user: UserDocument) {
    return user.isEmailVerified && !user.emailVerificationToken;
  }

  private async handleNonVerifiedEmail(user: UserDocument) {
    const token = await this.jwtService.signAsync(
      {
        id: user._id,
        email: user.email,
      },
      {
        expiresIn: '3h',
      },
    );
    if (!token)
      throw new BadRequestException(
        'invalid email verification token provided',
      );
    user.emailVerificationToken = token;
    await user.save();
    const link = `http://localhost:3000/api/v1/auth/verify-email?token=${token}`;
    const response = await this.mailService.sendEmail(user.email, link);
    if (!response) throw new BadRequestException('Error while sending email');
    return response;
  }
}
