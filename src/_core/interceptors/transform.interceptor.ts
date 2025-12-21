import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { PaginatedResponseDto, ResponseDto } from '../dto/response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  constructor(private readonly dtoClass: ClassConstructor<T>) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<ResponseDto<T> | PaginatedResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // Handle paginated responses
        if ('meta' in data && 'data' in data && Array.isArray(data.data)) {
          return {
            status: 'success',
            data: plainToInstance(this.dtoClass, data.data, {
              excludeExtraneousValues: true,
            }),
            meta: data.meta,
          };
        }
        // Handle single item responses
        return {
          status: 'success',
          data: plainToInstance(this.dtoClass, data, {
            excludeExtraneousValues: true,
          }),
        };
      }),
    );
  }
}
