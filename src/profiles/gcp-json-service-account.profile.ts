import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GCPJSONServiceAccountProfile {
  @IsString()
  @IsIn(['json-service-account'], {
    message: "type must be 'json-service-account'",
  })
  type = 'json-service-account';

  @IsString()
  @IsIn(['gcp'], {
    message: "type must be 'gcp'",
  })
  provider = 'gcp';

  @IsString()
  @IsNotEmpty()
  file: string;
}
