import { Injectable } from '@nestjs/common';
import { Database } from 'src/system/database';
import { ConfigProvider } from 'src/system/ConfigProvider';

@Injectable()
export class TransactionGateway extends Database {
	transactionTable: string;
	bankAccountTable: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.transactionTable = 'transactions';
		this.bankAccountTable = 'transactions';
	}
	getLastTranzactions(nr: number, id: number): Promise<any> {
		console.log('db');
		const sql = `
		SELECT *
		FROM ${this.transactionTable} as tr
		LEFT JOIN ${this.bankAccountTable} as ba
		ON tr.account_id = ba.id
		WHERE user_id = ? AND DATEDIFF(day,date_time,GETDATE()) between 0 and ?
		`;
		const r = this.query({
			sql,
			values: [id, nr],
		});
		console.log(r);
		return this.query({
			sql,
			values: [id, nr],
		});
	}
	getLastTranzactionsSum(nr: number, id: number): Promise<any> {
		console.log('db');
		const sql = `
		SELECT SUM(amount)
		FROM ${this.transactionTable} as tr
		LEFT JOIN ${this.bankAccountTable} as ba
		ON tr.account_id = ba.id
		WHERE user_id = ? AND DATEDIFF(day,date_time,GETDATE()) between 0 and ?
		`;
		return this.query({
			sql,
			values: [id, nr],
		});
	}
}