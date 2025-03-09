import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Access } from '../entities/access.entity';

@Injectable()
export class AccessService {
  PERMISSIONS: {
    resource: string;
    action: string;
    levels: string[];
  }[] = [
    {
      resource: 'company',
      action: 'delete',
      levels: ['owner'],
    },
    {
      resource: 'team',
      action: 'edit',
      levels: ['owner', 'admin', 'editor'],
    },
    {
      resource: 'team',
      action: 'delete',
      levels: ['owner', 'admin', 'editor'],
    },
  ];

  constructor(
    @InjectModel(Access.name) private readonly accessModel: Model<Access>,
  ) {}

  /**
   * Check if a user can perform an action on a resource
   *
   * action: view, edit, delete
   *
   * @param userId
   * @param companyId
   * @param resource
   * @param action
   */
  async canPerformAction(
    userId: string,
    companyId: string,
    resource: string,
    action: string,
  ): Promise<{ can: boolean; access?: Access }> {
    // Fetch user's access level for the given company
    const access = await this.getAccess(userId, companyId);

    // If no access found, deny the action
    if (!access) {
      return { can: false };
    }

    // Owners can perform all actions
    if (access.level === 'owner') {
      return { can: true, access };
    }

    // Find the matching permission rule for the requested action on the resource
    const permission = this.PERMISSIONS.find(
      (perm) => perm.resource === resource && perm.action === action,
    );

    // If no permission rule exists for this action, deny by default
    if (!permission) {
      return { can: false };
    }

    // Check if the user's access level is allowed to perform the action
    if (permission.levels.includes(access.level)) {
      return { can: true, access };
    }

    // Viewers can only view, and only if explicitly allowed in PERMISSIONS
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
