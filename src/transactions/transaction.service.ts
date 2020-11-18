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
		const rez = [result[0], result[1], result[2], result[3], result[4]];
		return rez;
	}
	async lastTransactionsAmount(days: number, userId: number): Promise<number>  {
		const [result] = await this.gateway.getLastTransactionsSum(days,userId);
		if (!result['SUM(amount)']) {
			return 0;
		}
		return result['SUM(amount)'];
	}
}