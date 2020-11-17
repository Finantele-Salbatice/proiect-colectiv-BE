import { Injectable } from '@nestjs/common';
import { Database } from 'src/system/database';
import { ConfigProvider } from 'src/system/ConfigProvider';

@Injectable()
export class TransactionGateway extends Database {
	transactionTable: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.transactionTable = 'transactions';
	}
	getLastTranzactions(nr: number): Promise<any> {
		console.log('db');
		const sql = `
		SELECT * FROM  ${this.transactionTable}
		WHERE DATEDIFF(day,date_time,GETDATE()) between 0 and ? 
		`;
		return this.query({
			sql,
			values: [nr],
		});
	}
}