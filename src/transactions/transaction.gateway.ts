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
		//console.log(userId);
		//console.log(filters);
		const querryBuilder = this.queryBuilder;
		// const sql = querryBuilder.columns('transactions.id','transactions.account_id','transactions.amount','transactions.transaction_id','transactions.details','transactions.currency','transactions.beneficiary','transactions.date_time','transactions.status','transactions.raw_data','transactions.additional_data','transactions.created_at','bank_accounts.user_id')
		// 	.from(this.transactionsTable)
		// 	.leftJoin('bank_accounts', 'transactions.account_id', 'bank_accounts.id')
		// 	.where('bank_accounts.user_id', userId)
		// 	.whereNotNull('amount')
		// 	//.whereBetween('amount',[filters.amountAbove, filters.amountBelow])
		// 	.andWhere(function() {
		// 		if (!isNaN(filters.amountAbove)) {
		// 			this.where('amount','>',filters.amountAbove);
		// 		}
		// 	})
		// 	.andWhere(function() {
		// 		if (!isNaN(filters.amountBelow)) {
		// 			this.where('amount','<',filters.amountBelow);
		// 		}
		// 	})
		// 	.andWhere(function() {
		// 		if (!isNaN(filters.)) {
		// 			this.where('amount','<',filters.amountBelow);
		// 		}
		// 	})
		// 	.andWhere(function() {
		// 		if (!isNaN(filters.amountBelow)) {
		// 			this.where('amount','<',filters.amountBelow);
		// 		}
		// 	})
		// 	.toQuery()
		// 	.toString();
		let sql = querryBuilder.columns('transactions.id','transactions.account_id','transactions.amount','transactions.transaction_id','transactions.details','transactions.currency','transactions.beneficiary','transactions.date_time','transactions.status','transactions.raw_data','transactions.additional_data','transactions.created_at','bank_accounts.user_id')
			.from(this.transactionsTable)
			.leftJoin('bank_accounts', 'transactions.account_id', 'bank_accounts.id');

		if (filters.amountAbove) {
			sql = sql.where('amount','>',filters.amountAbove);
		}
		const sql2 = sql.toQuery().toString();
		//sql = sql.toQuery().toString();
		console.log(sql2);
		return this.query({
			sql:sql2,
		});
	}
}