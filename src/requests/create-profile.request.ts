import { IsBase64, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';

export enum Platform {
  AWS = 'AWS',
  GCP = 'GCP',
}

export enum GCPCredentialType {
  JSON_SERVICE_ACCOUNT = 'json-service-account',
}

export class CreateProfileRequest {
  @IsEnum(Platform)
  platform: Platform;

  @ValidateIf((o) => o.platform === Platform.GCP)
  @IsEnum(GCPCredentialType, {
    message: 'For GCP, credentialType must be: json-service-account',
  })
  credentialType: GCPCredentialType;

  @IsNotEmpty({ message: 'Credential data is required' })
  @IsBase64()
  credentialData: string;
}
