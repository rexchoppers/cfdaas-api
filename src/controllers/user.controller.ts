import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import { Controller, Get } from '@nestjs/common';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { plainToInstance } from 'class-transformer';
import { GetUserResponse } from '../commands/responses/get-user.response';

@Controller('user')
@Authentication()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
  ): Promise<GetUserResponse> {
    const sub = cognitoUser.sub;

    const user = await this.userService.getUser({ cognitoId: sub });

    return plainToInstance(GetUserResponse, user, {
      excludeExtraneousValues: true,
    });
  }
}
