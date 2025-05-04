// src/contents/dto/update-content.dto.ts
import { IsString, IsEnum, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  email?: string;

  @IsString()
  password?: string;

  @IsString()
  name?: string;

  @IsEnum(['admin', 'editor', 'client'])
  role?: string;

  @IsString()
  updatedBy: string;
}
