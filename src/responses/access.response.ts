import { Expose, Type } from 'class-transformer';
import { CompanyResponse } from './company.response';
import { UserResponse } from './user.response';

export class AccessResponse {
  @Expose()
  id: string;

  @Expose()
  @Type(() => CompanyResponse)
  company: CompanyResponse;

  @Expose()
  @Type(() => UserResponse)
  user: UserResponse;

  @Expose()
  level: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
