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

	getAccountsByUser(userId: number): Promise<any> {
		const sql = `
			SELECT * FROM ${this.bankAccountTable}
			WHERE user_id = ?;
		`;

		return this.query({
			sql,
			values: [userId],
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

	updateBankAccountById(account: IBankAccount, id: number): Promise<any> {
		const sql = `
		UPDATE ${this.bankAccountTable}
		SET ?
		WHERE id = ?;`;

		return this.query({
			sql,
			values: [account, id],
		});
	}

	updateBankAccountByIban(account: IBankAccount, iban: string): Promise<any> {
		const sql = `
		UPDATE ${this.bankAccountTable}
		SET ?
    WHERE iban = ?;`;

		delete account.id;
		delete account.iban;

		return this.query({
			sql,
			values: [account, iban],
		});
	}
}