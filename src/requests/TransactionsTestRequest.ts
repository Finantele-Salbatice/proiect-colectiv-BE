import { AuthRequest } from './AuthRequest';

export interface ITransactionsListRequest extends AuthRequest {
  body: ITransactionsListFilters;
}

export interface ITransactionsListFilters {
  orderBy?: string;
  order?: string;
  from?: Date;
  to?: Date;
  accountId?: number;
  amountAbove?: number;
  amountBelow?: number;
  skip: number;
  limit: number;
}