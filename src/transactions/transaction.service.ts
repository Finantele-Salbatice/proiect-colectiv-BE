import { Injectable } from '@nestjs/common';
import { ITransactionsListFilters } from 'src/requests/TransactionsTestRequest';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { TransactionGateway } from './transaction.gateway';

@Injectable()
export class TransactionService {
	constructor(private gateway: TransactionGateway, private configProvider: ConfigProvider) {
	}
	async filterTransactions(body: ITransactionsListFilters, user: { userId: number; }): Promise<any> {
		console.log(body);
		console.log(user);
		const filter: ITransactionsListFilters = {
			orderBy: 'string',
			accountId: 1,
			amountAbove: 1,
			amountBelow: 1,
			skip: 1,
			limit: 1,
		};
		const [result] = await this.gateway.getTransactionsWithFilters(1, filter);
		console.log(result);
		return result;
	}
}

