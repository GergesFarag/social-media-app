import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseObjIdPipe implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectId(value))
      throw new BadRequestException('Invalid ObjectId');
    return value;
  }
}
