import { Controller, Post, Body, Param, ForbiddenException, Get, ValidationPipe } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { CreateProfileRequest } from '../requests/create-profile.request';
import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { CompanyService } from '../services/company.service';
import { AccessService } from '../services/access.service';

@Controller()
@Authentication()
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly accessService: AccessService,
    private readonly profileService: ProfileService,
  ) {}

  @Get('/company/:companyId/profile')
  async getProfiles(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
  ) {
    const user = await this.userService.getUser({ cognitoId: cognitoUser.sub });
    const company = await this.companyService.getCompany(companyId);

    if (!company) {
      throw new ForbiddenException();
    }

    const access = await this.accessService.getAccess(user.id, company.id);

    if (!access) {
      throw new ForbiddenException();
    }
  }

  @Post('/company/:companyId/profile')
  async createProfile(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
    @Body(ValidationPipe) createProfileRequest: CreateProfileRequest,
  ) {
    const user = await this.userService.getUser({ cognitoId: cognitoUser.sub });
    const company = await this.companyService.getCompany(companyId);

    if (!company) {
      throw new ForbiddenException();
    }

    const access = await this.accessService.getAccess(user.id, company.id);

    if (!access) {
      throw new ForbiddenException();
    }

    const requesterAccess = await this.accessService.canPerformAction(
      user.id,
      companyId,
      'profile',
      'edit',
    );

    if (!requesterAccess) {
      throw new ForbiddenException();
    }

    return this.profileService.createProfile(companyId, createProfileRequest);
  }
}
