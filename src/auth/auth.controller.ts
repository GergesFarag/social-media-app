import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { TransformResponse } from 'src/_core/decorators/transform-response.decorator';
import { LoginResponseDto } from './dto/login-response.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @TransformResponse(LoginResponseDto)
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @TransformResponse(LoginResponseDto)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() response: Response) {
    try {
      const isVerified = await this.authService.verifyEmail(token);
      if (!isVerified) throw new UnauthorizedException('Email is not verified');
      return response.status(HttpStatus.OK).render('verify-email', {
        title: 'Success',
        message: 'Your Email has been verified successfully!',
      });
    } catch (err) {
      return response.status(err.status).render('verify-email', {
        title: 'Verification Failed',
        message: 'Invalid or expired verification link',
      });
    }
  }
}
