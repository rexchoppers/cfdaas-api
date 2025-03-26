import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class GCPJSONServiceAccountProfile {
  @IsString()
  @IsIn(['json-service-account'], {
    message: "type must be 'json-service-account'",
  })
  type = 'json-service-account';
}
