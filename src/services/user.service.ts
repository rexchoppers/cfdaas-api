import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';
import { CompanyService } from './company.service';
import { AccessService } from './access.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject('COGNITO_CLIENT')
    private readonly cognito: CognitoIdentityProviderClient,
    private readonly configService: ConfigService,
    private readonly companyService: CompanyService,
    private readonly accessService: AccessService,
  ) {}

  async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    cognito?: {
      verified?: boolean;
      password?: string;
    };
  }) {
    const existingUser = await this.userModel.findOne({ email: data.email });

    if (existingUser) {
      throw new ConflictException({
        message: 'User already exists',
      });
    }

    let user = new this.userModel({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // Create user in Cognito
    const command = new AdminCreateUserCommand({
      UserPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
      Username: data.email,
      UserAttributes: [
        {
          Name: 'email',
          Value: data.email,
        },
        {
          Name: 'given_name',
          Value: data.firstName,
        },
        {
          Name: 'family_name',
          Value: data.lastName,
        },
        {
          Name: 'email_verified',
          Value: 'false',
        },
      ],
      MessageAction: 'SUPPRESS',
    });

    const cognitoAdminCreateUserResponse = await this.cognito.send(command);

    user.cognitoId = cognitoAdminCreateUserResponse.User.Attributes.find(
      (attribute) => attribute.Name === 'sub',
    )?.Value;

    user = await user.save();

    // Mark the user as verified in Cognito
    if (data.cognito?.verified) {
      const cognitoAdminUpdateUserAttributesCommand =
        new AdminUpdateUserAttributesCommand({
          UserPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
          Username: data.email,
          UserAttributes: [
            {
              Name: 'email_verified',
              Value: 'true',
            },
          ],
        });

      await this.cognito.send(cognitoAdminUpdateUserAttributesCommand);
    }

    if (data.cognito?.password) {
      const cognitoSetPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
        Username: data.email,
        Password: data.cognito.password,
        Permanent: true,
      });

      await this.cognito.send(cognitoSetPasswordCommand);
    }

    return user;
  }

  async getUser(data: { email?: string; id?: string; cognitoId?: string }) {
    if (data.email) {
      return this.userModel.findOne({ email: data.email });
    }

    if (data.id) {
      return this.userModel.findById(data.id);
    }

    if (data.cognitoId) {
      return this.userModel.findOne({ cognitoId: data.cognitoId });
    }
  }

  async deleteUser(data: { id: string; companyId: string }) {
    const user = await this.userModel.findById(data.id);
    const company = await this.companyService.getCompany(data.companyId);
    const access = await this.accessService.getAccess(user.id, company.id);

    // Delete access
    access.deleteOne();

    // Delete user
    user.deleteOne();

    // Delete user in Cognito
    const command = new AdminDeleteUserCommand({
      UserPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
      Username: user.email,
    });

    await this.cognito.send(command);
  }
}
