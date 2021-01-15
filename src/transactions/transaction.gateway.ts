import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { Database } from 'src/system/database';
import { TransactionsListFilters } from 'src/requests/TransactionsListRequest';
import * as moment from 'moment';
import { ITransaction } from './models/Transactions';

const defaultLimit = 20;
const defaultSkip = 0;
const defaultOrderBy = 'date_time';
const defaultOrderByList = ['amount', 'date_time'];
const defaultOrder = 'desc';
const defaultOrderList = ['asc', 'desc'];

@Injectable()
export class TransactionGateway extends Database {
	transactionsTable: string;
	bankAccountsTable: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.transactionsTable = 'transactions';
		this.bankAccountsTable = 'bank_accounts';
	}

	getTransactionsWithFilters(userId: number, filters: TransactionsListFilters): Promise<any> {
		const querryBuilder = this.queryBuilder;
		let sql = querryBuilder.columns('transactions.id','transactions.account_id','transactions.amount','transactions.transaction_id','transactions.details','transactions.currency','transactions.beneficiary','transactions.date_time','transactions.status')
			.from(this.transactionsTable)
			.leftJoin('bank_accounts', 'transactions.account_id', 'bank_accounts.id')
			.where('bank_accounts.user_id',userId);
		if (Number.isInteger(filters.amountAbove)) {
			sql = sql.where('transactions.amount','>=',filters.amountAbove);
		}
		if (Number.isInteger(filters.amountBelow)) {
			sql = sql.where('transactions.amount','<=',filters.amountBelow);
		}
		if (Number.isInteger(filters.accountId)) {
			sql = sql.where('transactions.account_id',filters.accountId);
		}
		if (filters.from) {
			const fr = moment(filters.from);
			if (fr.isValid()) {
				sql = sql.where('transactions.date_time','>=',filters.from);
			}
		}
		if (filters.to) {
			const to = moment(filters.to);
			if (to.isValid()) {
				sql = sql.where('transactions.date_time','<=',filters.to);
			}
		}
		if (Number.isInteger(filters.limit) && filters.limit >= 0 ) {
			sql = sql.limit(filters.limit);
		} else {
			sql = sql.limit(defaultLimit);
		}
		if (Number.isInteger(filters.skip) && filters.skip >= 0 ) {
			sql = sql.offset(filters.skip);
		} else {
			sql = sql.offset(defaultSkip);
		}
		if (filters.orderBy && defaultOrderByList.includes(filters.orderBy)) {
			if (filters.order && defaultOrderList.includes(filters.order)) {
				sql = sql.orderBy(filters.orderBy, filters.order);
			} else {
				sql = sql.orderBy(filters.orderBy, defaultOrder);
			}
		} else {
			sql = sql.orderBy(defaultOrderBy, defaultOrder);
		}

		const sql2 = sql.toQuery().toString();
		return this.query({
			sql:sql2,
		});
	}
	getTransactionsCountWithFilters(userId: number, filters: TransactionsListFilters): Promise<any> {
		const querryBuilder = this.queryBuilder;
		let sql = querryBuilder.columns()
			.count('transactions.id', {
				as: 'count',
			})
			.from(this.transactionsTable)
			.leftJoin('bank_accounts', 'transactions.account_id', 'bank_accounts.id')
			.where('bank_accounts.user_id',userId);
		if (Number.isInteger(filters.amountAbove)) {
			sql = sql.where('transactions.amount','>=',filters.amountAbove);
		}
		if (Number.isInteger(filters.amountBelow)) {
			sql = sql.where('transactions.amount','<=',filters.amountBelow);
		}
		if (Number.isInteger(filters.accountId)) {
			sql = sql.where('transactions.account_id',filters.accountId);
		}
		if (filters.from) {
			const fr = moment(filters.from);
			if (fr.isValid()) {
				sql = sql.where('transactions.date_time','>=',filters.from);
			}
		}
		if (filters.to) {
			const to = moment(filters.to);
			if (to.isValid()) {
				sql = sql.where('transactions.date_time','<=',filters.to);
			}
		}

		const sql2 = sql.toQuery().toString();
		return this.query({
			sql:sql2,
		});
	}

	getLastTransactions(days: number, userId: number): Promise<any> {
		const sql = `
		SELECT * FROM ${this.transactionsTable} as tr
		LEFT JOIN ${this.bankAccountsTable} as bank
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
		SELECT coalesce(SUM(amount), 0) as amount FROM ${this.transactionsTable} as tr
		LEFT JOIN ${this.bankAccountsTable} as bank
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
		INSERT IGNORE INTO ${this.transactionsTable} SET ?;
		`;

		return this.query({
			sql,
			values: [transaction],
		});
	}
}