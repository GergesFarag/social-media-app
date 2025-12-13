import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { RolesEnum } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    console.log('reflector', reflector);
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<RolesEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<Request>();
    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }
    if (!roles.includes(user.role as RolesEnum)) {
      throw new UnauthorizedException(
        'You do not have permission to access this resource',
      );
    }
    return true;
  }
}
