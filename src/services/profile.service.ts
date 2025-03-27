import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from '../entities/profile.entity';
import { CreateProfileRequest } from '../requests/create-profile.request';
import { Platform, CredentialType } from '../types/profile.types';
import { AwsSecretsManagerService } from './aws/aws-secrets-manager.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    private readonly awsSecretsManagerService: AwsSecretsManagerService
  ) {}

  async createProfile(companyId: string, request: CreateProfileRequest): Promise<Profile> {
    // Decode and validate credentials
    const credentials = this.decodeAndValidateCredentials(
      request.credentialData,
      request.platform,
      request.credentialType
    );

    // Create profile
    const profile = new this.profileModel({
      company: companyId,
      name: request.name,
      description: request.description,
      platform: request.platform,
      credentialType: request.credentialType,
      region: request.region,
      projectId: request.projectId,
      accountId: request.accountId,
      credentialsSecretId: ''
    });

    profile.save();

    // Create a name that links to the ID of the profile
    const secret = await this.awsSecretsManagerService.createSecret(
      `${companyId}-${profile.id}`,
      JSON.stringify(credentials)
    );

    profile.credentialsSecretId = secret;
    profile.save();

    return profile;
  }

  private decodeAndValidateCredentials(
    credentialData: string,
    platform: Platform,
    credentialType: CredentialType
  ): any {
    try {
      const decoded = Buffer.from(credentialData, 'base64').toString();
      const credentials = JSON.parse(decoded);

      switch (credentialType) {
        case CredentialType.GCP_SERVICE_ACCOUNT:
          this.validateGCPServiceAccountCredentials(credentials);
          break;
        case CredentialType.AWS_ACCESS_KEY:
          this.validateAWSAccessKeyCredentials(credentials);
          break;
        // Add other credential type validations
      }

      return credentials;
    } catch (error) {
      throw new BadRequestException(`Invalid credential data: ${error.message}`);
    }
  }

  private validateGCPServiceAccountCredentials(credentials: any) {
    const requiredFields = [
      'type',
      'project_id',
      'private_key_id',
      'private_key',
      'client_email'
    ];

    for (const field of requiredFields) {
      if (!credentials[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  private validateAWSAccessKeyCredentials(credentials: any) {
    const requiredFields = ['access_key_id', 'secret_access_key'];

    for (const field of requiredFields) {
      if (!credentials[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  async getProfiles(companyId: string) {
    return this.profileModel.find({ company: companyId }).exec();
  }

  /*  async addAccess(
    userId: string,
    companyId: string,
    level: 'owner' | 'admin' | 'editor' | 'viewer',
  ) {
    const access = new this.accessModel({
      user: userId,
      company: companyId,
      level,
    });

    return await access.save();
  }*/
}
