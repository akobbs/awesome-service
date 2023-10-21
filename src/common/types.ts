import { Request } from 'express';
import { AccessTokenPayload } from '../auth/types';

export interface RequestWithUser extends Request {
  user: AccessTokenPayload;
}
