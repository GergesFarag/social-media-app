import { Expose } from 'class-transformer';
import { IPagination } from '../interfaces/pagination.interface';

export class ResponseDto<T> {
  @Expose()
  data: T;
  @Expose()
  status: 'success' | 'failure' = 'success';
}
export class PaginatedResponseDto<T> {
  @Expose()
  data: T[];
  @Expose()
  meta: IPagination;
  @Expose()
  status: 'success' | 'failure' = 'success';
}
