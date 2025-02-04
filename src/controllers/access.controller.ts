import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import { Controller, Get } from '@nestjs/common';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { plainToInstance } from 'class-transformer';
import { AccessService } from '../services/access.service';
import { AccessResponse } from '../responses/access.response';

@Controller('access')
@Authentication()
export class AccessController {
  constructor(
    private readonly userService: UserService,
    private readonly accessService: AccessService,
  ) {}

  @Get()
  async getAccesses(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
  ): Promise<AccessResponse[]> {
    const sub = cognitoUser.sub;

    const user = await this.userService.getUser({ cognitoId: sub });

    const accesses = await this.accessService.getAccesses(user.id);

    return plainToInstance(AccessResponse, accesses, {
      excludeExtraneousValues: true,
    });
  }
}
