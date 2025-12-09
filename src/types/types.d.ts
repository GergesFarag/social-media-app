import { JWTPayload } from '../utils/interfaces/jwtPayload.interface';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
