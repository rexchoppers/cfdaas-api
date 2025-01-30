import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
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
}
