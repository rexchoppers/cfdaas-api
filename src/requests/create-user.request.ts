import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { AccessLevel } from '../entities/access.entity';

export class CreateUserRequest {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEnum(['owner', 'admin', 'editor', 'viewer'], {
    message: 'Level must be one of: owner, admin, editor, viewer',
  })
  level: AccessLevel;
}
