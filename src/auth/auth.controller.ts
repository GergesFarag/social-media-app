import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { TransformResponse } from 'src/_core/decorators/transform-response.decorator';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
@TransformResponse(LoginResponseDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('sign-up')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
