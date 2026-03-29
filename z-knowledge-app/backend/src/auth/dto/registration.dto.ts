import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class registrationDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  username: string;
}
