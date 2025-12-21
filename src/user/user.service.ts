import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtPayload } from 'src/types/jwtPayload';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  getProfile(user: JwtPayload) {
    return this.userModel.findById(user.id);
  }

  updateProfile(user: JwtPayload, updateProfileDto: UpdateProfileDto) {
    try {
      return this.userModel.findByIdAndUpdate(user.id, updateProfileDto, {
        new: true,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update profile');
    }
  }

  getAllUsers() {
    return this.userModel.find({ isDeleted: false });
  }

  removeProfile(user: JwtPayload) {
    try {
      return this.userModel.findByIdAndUpdate(
        user.id,
        { isDeleted: true },
        { new: true },
      );
    } catch (error) {
      throw new BadRequestException('Failed to delete profile');
    }
  }
}
