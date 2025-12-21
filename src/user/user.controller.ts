import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayload } from 'src/types/jwtPayload';
import { CurrentUser } from 'src/_core/decorators/current-user.decorator';
import { UserProfileResponseDto } from './dto/profile-response.dto';
import { TransformResponse } from 'src/_core/decorators/transform-response.decorator';
import { AuthGuard } from 'src/_core/guards/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Roles } from 'src/_core/decorators/roles.decorator';
import { RolesEnum } from 'src/_core/enums/roles.enum';
import { RolesGuard } from 'src/_core/guards/roles.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @TransformResponse(UserProfileResponseDto)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @TransformResponse(UserProfileResponseDto)
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  @TransformResponse(UserProfileResponseDto)
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user, updateProfileDto);
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  @TransformResponse(UserProfileResponseDto)
  deleteProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.removeProfile(user);
  }
}
