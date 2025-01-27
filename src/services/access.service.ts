import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Access } from '../entities/access.entity';

@Injectable()
export class AccessService {
  constructor(
    @InjectModel(Access.name) private readonly accessModel: Model<Access>,
  ) {}

  async getAccess(userId: string, companyId: string) {
    return this.accessModel.findOne({
      user: userId,
      company: companyId,
    });
  }

  async addAccess(
    userId: string,
    companyId: string,
    role: 'admin' | 'editor' | 'viewer',
  ) {
    const access = new this.accessModel({
      user: userId,
      company: companyId,
      role,
    });

    return await access.save();
  }
}
