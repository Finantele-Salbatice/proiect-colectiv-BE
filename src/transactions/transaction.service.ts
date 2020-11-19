import { ITransaction } from './models/Transactions';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { TransactionGateway } from './transaction.gateway';

@Injectable()
export class TransactionService {

	constructor(private gateway: TransactionGateway, private configProvider: ConfigProvider) {}

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