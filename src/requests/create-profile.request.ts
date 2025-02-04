import { IsBase64, IsEnum, IsNotEmpty } from 'class-validator';

export enum Platform {
  AWS = 'AWS',
  GCP = 'GCP',
}

export class CreateProfileRequest {
  @IsEnum(Platform)
  platform: Platform;

  @IsNotEmpty()
  @IsBase64()
  data: string;
}
