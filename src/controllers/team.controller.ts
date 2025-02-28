import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import { Controller, ForbiddenException, Get, Param } from '@nestjs/common';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { plainToInstance } from 'class-transformer';
import { AccessService } from '../services/access.service';
import { CompanyService } from '../services/company.service';
import { AccessResponse } from '../responses/access.response';

@Controller()
@Authentication()
export class TeamController {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly accessService: AccessService,
  ) {}

  @Get('/company/:companyId/team')
  async getTeam(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
  ): Promise<AccessResponse[]> {
    const user = await this.userService.getUser({ cognitoId: cognitoUser.sub });
    const company = await this.companyService.getCompany(companyId);

    const access = await this.accessService.canPerformAction(
      user.id,
      companyId,
      'team',
      'view',
    );

    if (!access.can) {
      throw new ForbiddenException();
    }

    // Get all the accesses for a company
    const accesses = await this.accessService.getAccessesByCompany(companyId);

    // Return all accesses for a company
    return plainToInstance(AccessResponse, accesses, {
      excludeExtraneousValues: true,
    });
  }
}
