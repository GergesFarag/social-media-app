import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class DeleteCommentDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(2000)
  deleteReason: string;
}
