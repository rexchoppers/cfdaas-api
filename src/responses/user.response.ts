import { Expose } from 'class-transformer';

export class UserResponse {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  active: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
