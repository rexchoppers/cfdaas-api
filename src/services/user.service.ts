import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    const existingUser = await this.userModel.findOne({ email: data.email });

    if (existingUser) {
      throw new ConflictException({
        message: 'User already exists',
      });
    }

    const user = new this.userModel({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    return await user.save();
  }
}
