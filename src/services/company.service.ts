import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { Access } from '../entities/access.entity';
import { UserService } from './user.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly userService: UserService,
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
    @InjectModel(Access.name) private readonly accessModel: Model<Access>,
  ) {}

  async getCompany(id: string) {
    return this.companyModel.findById(id);
  }

  async createCompany(data: { name: string; owner: User }) {
    const company = new this.companyModel({
      name: data.name,
      owner: data.owner,
    });

    return await company.save();
  }

  async updateCompany(id: string, data) {
    // Fetch the company
    const company = await this.companyModel.findById(id);

    // If company doesn't exist, return null (or throw an error)
    if (!company) {
      return null;
    }

    const updatedData = {
      ...company.toObject(),
      ...data,
    };

    // Update only if necessary
    return this.companyModel.findByIdAndUpdate(id, updatedData, { new: true });
  }
}
