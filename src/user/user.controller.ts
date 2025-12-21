import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayload } from 'src/types/jwtPayload';
import { CurrentUser } from 'src/_core/decorators/current-user.decorator';
import { UserProfileResponseDto } from './dto/userProfile-response.dto';
import { TransformResponse } from 'src/_core/decorators/transform-response.decorator';
import { AuthGuard } from 'src/_core/guards/auth.guard';
import { RolesGuard } from 'src/_core/guards/roles.guard';
import { RolesEnum } from 'src/_core/enums/roles.enum';
import { Roles } from 'src/_core/decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @TransformResponse(UserProfileResponseDto)
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user);
  }
}
