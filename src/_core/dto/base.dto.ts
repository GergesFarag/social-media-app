import { Expose, Transform } from 'class-transformer';

export abstract class BaseDto {
  @Expose()
  @Transform(({ obj }) => obj?._id.toString())
  _id: string;
}
