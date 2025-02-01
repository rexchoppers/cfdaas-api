import { Expose, Transform } from 'class-transformer';

export class GetUserResponse {
  @Expose()
  id: string;
}
