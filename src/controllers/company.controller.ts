import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import { Controller, Get, Param, Post } from "@nestjs/common";
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { plainToInstance } from 'class-transformer';
import { GetUserResponse } from '../commands/responses/get-user.response';
import { CompanyService } from "../services/company.service";
import { AccessService } from 'src/services/access.service';

@Controller('company')
@Authentication()
export class CompanyController {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly accessService: AccessService,
  ) {}

  @Post(':companyId/encryption/generate')
  async generateEncryption(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
  ): Promise<GetUserResponse> {
    const user = await this.userService.getUser({ cognitoId: cognitoUser.sub });
    const company = await this.companyService.getCompany(companyId);

    const access =
  }
}
