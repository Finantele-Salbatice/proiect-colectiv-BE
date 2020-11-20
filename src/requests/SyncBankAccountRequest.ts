import { AuthRequest } from './AuthRequest';

export interface ISyncAccountRequest extends AuthRequest {
  body: ISyncAccountBody;
}

export interface ISyncAccountBody {
  accountId: number;
}