import { Expose } from 'class-transformer';

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
  region?: string;

  @Expose()
  projectId?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
