import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CompanyService } from '../services/company.service';
import { AccessService } from 'src/services/access.service';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { CreateProfileRequest } from '../requests/create-profile.request';

@Controller()
@Authentication()
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly accessService: AccessService,
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

    console.log("Creating profile...");

    return 'test';
  }
}
