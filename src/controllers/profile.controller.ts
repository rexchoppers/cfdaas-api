import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  ValidationPipe
} from "@nestjs/common";
import { UserService } from '../services/user.service';
import { CompanyService } from '../services/company.service';
import { AccessService } from 'src/services/access.service';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import {
  CreateProfileRequest,
  Platform,
} from '../requests/create-profile.request';

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

    const requesterAccess = await this.accessService.canPerformAction(
      user.id,
      companyId,
      'profile',
      'edit',
    );

    /**
     * GCP: json-service-account
     *
     * { "platform": "gcp", "type": "json-service-account",  "file": "..." }
     */
    if (createProfileRequest.platform === Platform.GCP) {
      switch (createProfileRequest.credentialType) {
        case 'json-service-account':
          const credentialData = Buffer.from(
            createProfileRequest.credentialData,
            'base64',
          ).toString();

          if (!this.isValidBase64(credentialData)) {
            throw new BadRequestException('Invalid base64 data');
          }



          break;
      }
    }

    return 'test';
  }

  isValidBase64(str: string): boolean {
    // Check basic format
    const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;

    if (!base64Regex.test(str)) return false;

    try {
      // Decode and re-encode to ensure it's valid
      const decoded = atob(str);
      const reEncoded = btoa(decoded);
      return reEncoded === str.replace(/\n|\r/g, '');
    } catch (e) {
      return false;
    }
  }

}
