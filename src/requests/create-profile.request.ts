import { IsEnum, IsString, IsNotEmpty, IsBase64, IsOptional, Validate } from 'class-validator';
import { Platform, CredentialType, isValidCredentialTypeForPlatform } from '../types/profile.types';

export class CreateProfileRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Platform)
  platform: Platform;

  @IsEnum(CredentialType)
  @Validate((value: CredentialType, args: any) => {
    const platform = (args.object as CreateProfileRequest).platform;
    return isValidCredentialTypeForPlatform(platform, value);
  }, {
    message: 'Invalid credential type for the specified platform'
  })
  credentialType: CredentialType;

  @IsBase64()
  @IsNotEmpty()
  credentialData: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  accountId?: string;
}