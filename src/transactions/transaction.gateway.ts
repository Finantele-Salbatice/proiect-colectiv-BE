import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { Database } from 'src/system/database';
import { ITransaction } from './models/Transactions';

@Injectable()
export class TransactionGateway extends Database {
	transactionTable: string;
	bankAccountTable: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.transactionTable = 'transactions';
		this.bankAccountTable = 'bank_accounts';
	}
	getLastTransactions(days: number, userId: number): Promise<any> {
		const sql = `
		SELECT * FROM ${this.transactionTable} as tr
		LEFT JOIN ${this.bankAccountTable} as bank
		ON tr.account_id = bank.id
		WHERE (tr.date_time > NOW() - INTERVAL ? DAY) AND bank.user_id = ?
		LIMIT 5;
		`;
		return this.query({
			sql,
			values: [days, userId],
		});
	}
	getLastTransactionsSum(days: number, userId: number): Promise<any> {
		const sql = `
		SELECT coalesce(SUM(amount), 0) as amount FROM ${this.transactionTable} as tr
		LEFT JOIN ${this.bankAccountTable} as bank
		ON tr.account_id = bank.id
		WHERE (tr.date_time > NOW() - INTERVAL ? DAY) AND bank.user_id = ?;
		`;
		return this.query({
			sql,
			values: [days, userId],
		});
	}

	insertTransaction(transaction: ITransaction): Promise<any> {
		const sql = `
		INSERT IGNORE INTO ${this.transactionTable} SET ?;
		`;

		return this.query({
			sql,
			values: [transaction],
		});
	}
}