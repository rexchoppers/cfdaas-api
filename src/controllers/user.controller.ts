import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import { Controller, Get } from '@nestjs/common';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';

@Controller('user')
@Authentication()
export class UserController {
  @Get()
  async getUser(@CognitoUser() user: CognitoJwtPayload) {
    console.log(user);
    return user;
  }
}
