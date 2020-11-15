
export interface ITransaction {
  id?: number;
  transaction_id?: number;
  amount?: number;
  currency?: number;
  details?: string;
  date_time?: Date;
  account_id?: number;
  status?: string;
  beneficiary?: string;
  type?: ITransactionDirection;
  additional_data?: string;
  created_at?: Date;
}

enum ITransactionDirection {
  in = 'in',
  out = 'out'
}