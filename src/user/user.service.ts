import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JWTPayload } from 'src/_core/interfaces/jwtPayload.interface';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  getProfile(user: JWTPayload) {
    return this.userModel.findById(user.id);
  }
}
