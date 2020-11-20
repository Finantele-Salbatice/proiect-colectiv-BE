import { EnumBanks } from 'src/accounts/models/Account';
import { AuthRequest } from './AuthRequest';

export interface IAccountAdd extends AuthRequest {
  body: {
    bank: EnumBanks;
  }
}