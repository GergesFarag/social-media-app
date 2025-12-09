import { Expose, Type } from 'class-transformer';

export abstract class BaseDto {
  @Type(() => String)
  @Expose()
  _id: string;
}
