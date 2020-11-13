
export interface ITransaction {
  id?: number;
  transactionId?: number;
  amount?: number;
  currency?: number;
  details?: string;
  dateTime?: Date;
  account_id?: number;
  beneficiary?: string;
  type?: ITransactionDirection;
  addition_data?: string;
  created_at?: Date;
}

enum ITransactionDirection {
  in = 'in',
  out = 'out'
}