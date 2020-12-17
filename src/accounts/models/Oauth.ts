
export interface IOauth {
  id?: number;
  user_id?: number;
  bank?: EnumBanks;
  status?: EnumBankAccountStatus;
  access_token?: string;
  refresh_token?: string;
  code_verifier?: string;
  additional_data?: any;
  token_expires_at?: Date;
}

export enum EnumBanks {
  BT = 'bt',
  BCR = 'bcr',
  BRD = 'brd'
}

export enum EnumBankAccountStatus {
  inProgess = 'inProgess'
}