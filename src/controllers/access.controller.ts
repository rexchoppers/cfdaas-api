import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import { Controller, Get } from '@nestjs/common';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { plainToInstance } from 'class-transformer';
import { GetUserResponse } from '../responses/get-user.response';

@Controller('access')
@Authentication()
export class AccessController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAccesses(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
  ): Promise<GetUserResponse> {
    const sub = cognitoUser.sub;

    const user = await this.userService.getUser({ cognitoId: sub });

    return plainToInstance(GetUserResponse, user, {
      excludeExtraneousValues: true,
    });
  }
}
