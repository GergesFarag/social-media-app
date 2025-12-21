import {
  IsArray,
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PrivacyEnum } from 'src/_core/enums/privacy.enum';
import { Media } from '../interfaces/media.interface';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PrivacyEnum)
  @IsNotEmpty()
  privacySetting: PrivacyEnum;

  @IsArray()
  @IsOptional()
  mediaUrls?: Media[];

  @IsHexColor()
  @IsOptional()
  backgroundColor?: string;

  commentsCount: number;
}
