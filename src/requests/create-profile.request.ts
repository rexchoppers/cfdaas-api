import { IsBase64, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';

export enum Platform {
  AWS = 'AWS',
  GCP = 'GCP',
}

export enum GCPCredentialType {
  SERVICE_ACCOUNT_KEY = 'service-account-key',
}

export class CreateProfileRequest {
  @IsEnum(Platform)
  platform: Platform;

  @ValidateIf((o) => o.platform === Platform.GCP)
  @IsEnum(GCPCredentialType, {
    message: 'For GCP, credentialType must be: service-account-key',
  })
  credentialType: GCPCredentialType;

  @IsNotEmpty({ message: 'Credential data is required' })
  @IsBase64()
  credentialData: string;
}
