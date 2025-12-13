import { Expose, Transform } from 'class-transformer';
import { Media } from 'src/post/interfaces/media.interface';

export class UploadResponseDto implements Media {
  @Expose()
  @Transform(({ obj }) => obj.secure_url)
  url: string;
  @Expose()
  version: number;
  @Expose()
  public_id: string;
  @Expose()
  display_name: string;
  @Expose()
  format: string;
  @Expose()
  resource_type: string;
}
