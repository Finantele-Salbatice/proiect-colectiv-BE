import { Injectable, NotFoundException } from '@nestjs/common';
import { ITransactionsListFilters } from 'src/requests/TransactionsTestRequest';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { TransactionGateway } from './transaction.gateway';

@Injectable()
export class TransactionService {
	constructor(private gateway: TransactionGateway, private configProvider: ConfigProvider) {
	}
	async filterTransactions(body: ITransactionsListFilters, userId: number): Promise<any> {
		if (!userId) {
			throw new NotFoundException('Invalid userId');
		}
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
		const result = await this.gateway.getTransactionsWithFilters(userId, filter);
		const result2 = await this.gateway.getTransactionsCountWithFilters(userId, filter);
		const res = [JSON.parse(JSON.stringify(result)), result2[0].count];
		return res;
	}

}

