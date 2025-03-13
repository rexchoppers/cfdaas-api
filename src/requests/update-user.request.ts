import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { AccessLevel } from '../entities/access.entity';

export class UpdateUserRequest {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  @IsEnum(['owner', 'admin', 'editor', 'viewer'], {
    message: 'Level must be one of: owner, admin, editor, viewer',
  })
  level?: AccessLevel;
}
