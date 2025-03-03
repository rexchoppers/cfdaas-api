import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import { Body, Controller, ForbiddenException, Get, Param, Post, ValidationPipe } from "@nestjs/common";
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { plainToInstance } from 'class-transformer';
import { AccessService } from '../services/access.service';
import { CompanyService } from '../services/company.service';
import { AccessResponse } from '../responses/access.response';
import { CreateProfileRequest } from "../requests/create-profile.request";
import { CreateUserRequest } from "../requests/create-user.request";

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

  @Post('/company/:companyId/team')
  async createTeam(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
    @Body(ValidationPipe) createUserRequest: CreateUserRequest,
  ) {
    const user = await this.userService.getUser({ cognitoId: cognitoUser.sub });
    const company = await this.companyService.getCompany(companyId);

    const access = await this.accessService.canPerformAction(
      user.id,
      companyId,
      'team',
      'edit',
    );

    if (!access.can) {
      throw new ForbiddenException();
    }

    // Create a new user
    const newUser = await this.userService.createUser({
      email: createUserRequest.email,
      firstName: createUserRequest.firstName,
      lastName: createUserRequest.lastName,
      cognito: {
        password: createUserRequest.password,
        verified: true,
      },
    });


  }
}
