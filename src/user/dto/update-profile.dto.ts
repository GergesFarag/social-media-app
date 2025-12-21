import {
  IsDateString,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MediaType } from 'src/_core/interfaces/media.interface';

export class UpdateProfileDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(100)
  @IsOptional()
  bio?: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: Date;

  @IsOptional()
  @IsObject()
  avatar?: MediaType;

  @IsOptional()
  @IsObject()
  coverImage?: MediaType;
}
