
export interface IBankAccount {
  id?: number;
  user_id?: number;
  bank?: EnumBanks;
  account_id?: string;
  iban?: string;
  balance?: number;
  description?: string;
  status?: EnumBankAccountStatus;
  access_token?: string;
  refresh_token?: string;
  code_verifier?: string;
  additional_data?: any;
  synced_at?: Date;
  transaction_see?: string;
  balance_see?: string;
  token_expires_at?: Date;
  currency?: string;
}

export enum EnumBanks {
  BT = 'bt',
  BCR = 'bcr'
}

export enum EnumBankAccountStatus {
  inProgess = 'inProgess'
}