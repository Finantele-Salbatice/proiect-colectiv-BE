import { Injectable } from '@nestjs/common';
import { Database } from 'src/system/database';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { ITransactionsListFilters } from 'src/requests/TransactionsTestRequest';

@Injectable()
export class TransactionGateway extends Database {
	transactionsTable: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.transactionsTable = 'transactions';
	}

	getTransactionsWithFilters(userId: number, filters: ITransactionsListFilters): Promise<any> {
		console.log(userId);
		console.log(filters);
		const querryBuilder = this.queryBuilder;
		const sql = querryBuilder.select().from(this.transactionsTable).toQuery().toString();
		console.log(sql);
		return this.query({
			sql,
		});
	}
}