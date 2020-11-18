import { Injectable } from '@nestjs/common';
import { ITransactionsListFilters } from 'src/requests/TransactionsTestRequest';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { TransactionGateway } from './transaction.gateway';

@Injectable()
export class TransactionService {
	constructor(private gateway: TransactionGateway, private configProvider: ConfigProvider) {
	}
	async filterTransactions(body: ITransactionsListFilters, user: { userId: number; }): Promise<any> {
		//console.log(body);
		//console.log(user);
		const filter: ITransactionsListFilters = {
			orderBy: body.orderBy,
			order: body.order,
			from: body.from,
			to: body.to,
			accountId: body.accountId,
			amountAbove: body.amountAbove,
			amountBelow: body.amountBelow,
			skip: body.skip,
			limit: body.limit,
		};
		const result = await this.gateway.getTransactionsWithFilters(user.userId, filter);
		console.log(result);
		return result;
	}
}

