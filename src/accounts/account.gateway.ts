import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { Database } from 'src/system/database';
import { IBankAccount } from './models/Account';
import { IOauth } from './models/Oauth';

@Injectable()
export class AccountGateway extends Database {
	bankAccountTable: string;
	oauthTable: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.bankAccountTable = 'bank_accounts';
		this.oauthTable = 'oauth';
	}

	addAccount(account: IBankAccount): Promise<any> {
		const sql = `
			INSERT INTO ${this.bankAccountTable} SET ?;
		`;

		return this.query({
			sql,
			values: [account],
		});
	}

	addOauth(oauth: IOauth): Promise<any> {
		const sql = `
		INSERT INTO ${this.oauthTable} SET ?;
	`;

		return this.query({
			sql,
			values: [oauth],
		});
	}

	getAccountById(id: number): Promise<any> {
		const sql = `
			SELECT * FROM ${this.bankAccountTable}
			WHERE id = ?;
		`;

		return this.query({
			sql,
			values: [id],
		});
	}

	getOauthById(id: number): Promise<any> {
		const sql = `
			SELECT * FROM ${this.oauthTable}
			WHERE id = ?;
		`;

		return this.query({
			sql,
			values: [id],
		});
	}
}