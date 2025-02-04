import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import {
  Controller,
  ForbiddenException,
  Get,
  Param,
} from '@nestjs/common';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { CompanyService } from '../services/company.service';
import { AccessService } from 'src/services/access.service';
import { CompanyResponse } from '../responses/company.response';
import { plainToInstance } from 'class-transformer';

@Controller('company')
@Authentication()
export class CompanyController {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly accessService: AccessService,
  ) {}

  @Get('/:companyId')
  async getCompany(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
  ): Promise<CompanyResponse> {
    const user = await this.userService.getUser({ cognitoId: cognitoUser.sub });
    const company = await this.companyService.getCompany(companyId);

    if (!company) {
      throw new ForbiddenException();
    }

    const access = await this.accessService.getAccess(user.id, company.id);

    if (!access) {
      throw new ForbiddenException();
    }

    return plainToInstance(CompanyResponse, company, {
      excludeExtraneousValues: true,
    });
  }
}
