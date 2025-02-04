import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from 'src/entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
  ) {}

  async getProfiles(companyId: string) {
    return this.profileModel.find({ company: companyId }).exec();
  }

  /*  async addAccess(
    userId: string,
    companyId: string,
    level: 'owner' | 'admin' | 'editor' | 'viewer',
  ) {
    const access = new this.accessModel({
      user: userId,
      company: companyId,
      level,
    });

    return await access.save();
  }*/
}
