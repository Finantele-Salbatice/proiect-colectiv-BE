import { ITransaction } from './models/Transactions';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { TransactionGateway } from './transaction.gateway';
import { TransactionsListFilters } from 'src/requests/TransactionsListRequest';

@Injectable()
export class TransactionService {
	constructor(private gateway: TransactionGateway, private configProvider: ConfigProvider) {
	}
	async filterTransactions(filter: TransactionsListFilters, userId: number): Promise<any> {
		if (!userId) {
			throw new NotFoundException('Invalid userId');
		}
		const result = await this.gateway.getTransactionsWithFilters(userId, filter);
		const [result2] = await this.gateway.getTransactionsCountWithFilters(userId, filter);
		const res = {
			data: result,
			count: result2.count,
		};
		return res;
	}

	async insertTransaction(transaction: ITransaction): Promise<any> {
		return this.gateway.insertTransaction(transaction);
	}
	async lastTransactions(days: number, userId: number): Promise<ITransaction[]> {
		const result = await this.gateway.getLastTransactions(days,userId);
		if (!result) {
			return [];
		}
		return result;
	}
	async lastTransactionsAmount(days: number, userId: number): Promise<number>  {
		const [result] = await this.gateway.getLastTransactionsSum(days,userId);
		return result.amount;
	}
}