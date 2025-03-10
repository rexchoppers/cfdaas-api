import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { UserService } from '../services/user.service';
import { plainToInstance } from 'class-transformer';
import { AccessService } from '../services/access.service';
import { CompanyService } from '../services/company.service';
import { AccessResponse } from '../responses/access.response';
import { CreateUserRequest } from '../requests/create-user.request';
import { UserResponse } from '../responses/user.response';

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
  async createTeamUser(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
    @Body(ValidationPipe) createUserRequest: CreateUserRequest,
  ): Promise<AccessResponse> {
    const user = await this.userService.getUser({ cognitoId: cognitoUser.sub });

    const userAccess = await this.accessService.canPerformAction(
      user.id,
      companyId,
      'team',
      'edit',
    );

    if (!userAccess.can) {
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

    // Add the access for the new user
    const access = await this.accessService.addAccess(
      newUser.id,
      companyId,
      createUserRequest.level,
    );

    return plainToInstance(AccessResponse, access, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('company/:companyId/team/:userId')
  async deleteTeamUser(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
  ): Promise<AccessResponse> {
    const requester = await this.userService.getUser({
      cognitoId: cognitoUser.sub,
    });

    const requesterAccess = await this.accessService.canPerformAction(
      requester.id,
      companyId,
      'team',
      'delete',
    );

    if (!requesterAccess.can) {
      throw new ForbiddenException();
    }

    // If the user is themselves, deny the action
    if (requester.id === userId) {
      throw new ConflictException();
    }

    // Get the access for the user
    const access = await this.accessService.getAccess(userId, companyId);

    if (!access) {
      throw new NotFoundException();
    }

    // Delete the access
    await this.accessService.deleteAccess(userId, companyId);

    return plainToInstance(AccessResponse, access, {
      excludeExtraneousValues: true,
    });
  }
}
