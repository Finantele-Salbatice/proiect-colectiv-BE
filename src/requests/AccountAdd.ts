import { EnumBanks } from 'src/accounts/models/Oauth';
import { AuthRequest } from './AuthRequest';

export interface IAccountAdd extends AuthRequest {
  body: {
    bank: EnumBanks;
  }
}