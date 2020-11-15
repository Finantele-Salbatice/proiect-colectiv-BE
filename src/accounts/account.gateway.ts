import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { Database } from 'src/system/database';
import { IBankAccount } from './models/Account';

@Injectable()
export class AccountGateway extends Database {
	table: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.table = 'bank_accounts';
	}

	addAccount(account: IBankAccount): any {
		const sql = `
			INSERT INTO ${this.table} SET ?;
		`;

		return this.query({
			sql,
			values: [account],
		});
	}
}