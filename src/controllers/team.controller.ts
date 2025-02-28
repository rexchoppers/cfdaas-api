import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import { Controller, Get, Param } from '@nestjs/common';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { plainToInstance } from 'class-transformer';
import { GetUserResponse } from '../responses/get-user.response';

@Controller()
@Authentication()
export class TeamController {
  constructor() {}

  @Get('/company/:companyId/team')
  async getTeam(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
  ) {

  }
}
