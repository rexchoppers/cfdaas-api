import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
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
import { UpdateUserRequest } from '../requests/update-user.request';
import {
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';

@Controller()
@Authentication()
export class TeamController {
  constructor(
    @Inject('COGNITO_CLIENT')
    private readonly cognito: CognitoIdentityProviderClient,
    private readonly configService: ConfigService,
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

  @Patch('company/:companyId/team/:userId')
  async updateTeamUser(
    @CognitoUser() cognitoUser: CognitoJwtPayload,
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Body(ValidationPipe) updateUserRequest: UpdateUserRequest,
  ) {
    const requester = await this.userService.getUser({
      cognitoId: cognitoUser.sub,
    });

    const requesterAccess = await this.accessService.canPerformAction(
      requester.id,
      companyId,
      'team',
      'edit',
    );

    if (!requesterAccess.can) {
      throw new ForbiddenException();
    }

    const access = await this.accessService.getAccess(userId, companyId);

    if (!access) {
      throw new NotFoundException();
    }

    // If a request has been made to change the role
    if (updateUserRequest.level) {
      // Get the access for the user

      // Update the access level
      access.level = updateUserRequest.level;
      await access.save();
    }

    /**
     * If any personal parameters have been updated such as:
     *
     * - First Name
     * - Last Name
     * - Password
     * - Email
     */
    if (
      updateUserRequest.firstName ||
      updateUserRequest.lastName ||
      updateUserRequest.password ||
      updateUserRequest.email
    ) {
      // Get the user
      const user = await this.userService.getUser({ id: userId });

      // Update the user
      if (updateUserRequest.firstName) {
        user.firstName = updateUserRequest.firstName;

        const cognitoAdminUpdateUserAttributesCommand =
          new AdminUpdateUserAttributesCommand({
            UserPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
            Username: user.email,
            UserAttributes: [
              {
                Name: 'given_name',
                Value: updateUserRequest.firstName,
              },
            ],
          });

        await this.cognito.send(cognitoAdminUpdateUserAttributesCommand);
      }

      if (updateUserRequest.lastName) {
        user.lastName = updateUserRequest.lastName;

        const cognitoAdminUpdateUserAttributesCommand =
          new AdminUpdateUserAttributesCommand({
            UserPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
            Username: user.email,
            UserAttributes: [
              {
                Name: 'family_name',
                Value: updateUserRequest.lastName,
              },
            ],
          });

        await this.cognito.send(cognitoAdminUpdateUserAttributesCommand);
      }

      if (updateUserRequest.email) {
        user.email = updateUserRequest.email;

        const cognitoAdminUpdateUserAttributesCommand =
          new AdminUpdateUserAttributesCommand({
            UserPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
            Username: user.email,
            UserAttributes: [
              {
                Name: 'email',
                Value: updateUserRequest.email,
              },
            ],
          });

        await this.cognito.send(cognitoAdminUpdateUserAttributesCommand);
      }

      if (updateUserRequest.password) {
        const cognitoSetPasswordCommand = new AdminSetUserPasswordCommand({
          UserPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
          Username: user.email,
          Password: updateUserRequest.password,
          Permanent: true,
        });

        await this.cognito.send(cognitoSetPasswordCommand);
      }

      await user.save();
    }

    return plainToInstance(AccessResponse, access, {
      excludeExtraneousValues: true,
    });
  }
}
