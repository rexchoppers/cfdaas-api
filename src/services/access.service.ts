import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Access } from '../entities/access.entity';

@Injectable()
export class AccessService {
  constructor(
    @InjectModel(Access.name) private readonly accessModel: Model<Access>,
  ) {}

  async canPerformAction(
    userId: string,
    companyId: string,
    resource: string,
    action: 'view' | 'edit' | 'delete',
  ): Promise<{ can: boolean; access?: Access }> {
    const ownerOnly = {
      company: 'delete',
    };

    const adminOnly = {
      team: 'edit',
    };

    const access = await this.getAccess(userId, companyId);

    // If the access has not been found, don't allow the action
    if (!access) {
      return { can: false };
    }

    // Owners can do anything
    if (access.level === 'owner') {
      return { can: true, access };
    }

    // Admins can do anything except what's defined in the ownerOnly object
    if (access.level === 'admin' && !ownerOnly[resource]) {
      return { can: true, access };
    }

    // Editors can only do anything that isn't in the adminOnly or ownerOnly objects
    if (
      access.level === 'editor' &&
      !adminOnly[resource] &&
      !ownerOnly[resource]
    ) {
      return { can: true, access };
    }

    // Viewers can only view
    if (access.level === 'viewer' && action === 'view') {
      return { can: true, access };
    }

    return { can: false };
  }

  async getAccess(userId: string, companyId: string) {
    return this.accessModel.findOne({
      user: userId,
      company: companyId,
    });
  }

  async getAccesses(userId: string) {
    return this.accessModel.find({ user: userId }).populate('company').exec();
  }

  async getAccessesByCompany(companyId: string) {
    return this.accessModel
      .find({ company: companyId })
      .populate('user')
      .exec();
  }

  async addAccess(
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
  }
}
