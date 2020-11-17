import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { Database } from 'src/system/database';
import { ITransaction } from './models/Transactions';

@Injectable()
export class TransactionGateway extends Database {
	transactionsTable: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.transactionsTable = 'transactions';
	}

	insertTransaction(transaction: ITransaction): Promise<any> {
		const sql = `
		INSERT IGNORE INTO ${this.transactionsTable} SET ?;
		`;

		return this.query({
			sql,
			values: [transaction],
		});
	}
}