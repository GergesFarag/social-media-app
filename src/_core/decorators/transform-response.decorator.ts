import { UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { ClassConstructor } from 'class-transformer';

export const TransformResponse = <T>(dtoClass: ClassConstructor<T>) => {
  return UseInterceptors(new TransformInterceptor(dtoClass));
};
