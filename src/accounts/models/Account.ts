import { EnumBanks } from './Oauth';

export interface IBankAccount {
  id?: number;
  oauth_id?: number
  user_id?: number;
  bank?: EnumBanks;
  account_id?: string;
  iban?: string;
  balance?: number;
  description?: string;
  status?: EnumBankAccountStatus;
  additional_data?: any;
  synced_at?: Date;
  transaction_see?: string;
  balance_see?: string;
  currency?: string;
}

export enum EnumBankAccountStatus {
  inProgess = 'inProgess'
}