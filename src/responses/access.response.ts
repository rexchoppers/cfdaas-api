import { Expose, Type } from 'class-transformer';
import { CompanyResponse } from './company.response';

export class AccessResponse {
  @Expose()
  id: string;

  @Expose()
  @Type(() => CompanyResponse)
  company: CompanyResponse;

  @Expose()
  level: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
