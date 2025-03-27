import { Expose } from 'class-transformer';
import { UserResponse } from "./user.response";

export class ProfileResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  platform: string;

  @Expose()
  credentialType: string;

  @Expose()
  createdBy: UserResponse;

  @Expose()
  region?: string;

  @Expose()
  projectId?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
