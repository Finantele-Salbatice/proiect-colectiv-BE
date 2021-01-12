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
			INSERT IGNORE INTO ${this.bankAccountTable} SET ?;
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
	getAccountsByAccountId(userId: number): Promise<any> {
		const sql = `
			SELECT * FROM ${this.bankAccountTable}
			WHERE account_id = ?;
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

	getOauthByAccountId(accountId: number): Promise<any> {
		const sql = `
      SELECT ${this.oauthTable}.* FROM ${this.oauthTable}
      JOIN ${this.bankAccountTable} ON
        ${this.bankAccountTable}.oauth_id = ${this.oauthTable}.id
			WHERE ${this.bankAccountTable}.id = ?;
		`;

		return this.query({
			sql,
			values: [accountId],
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

	updateOauthById(oauth: IOauth, id: number): Promise<any> {
		const sql = `
		UPDATE ${this.oauthTable}
		SET ?
    WHERE id = ?;`;

		delete oauth.id;

		return this.query({
			sql,
			values: [oauth, id],
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

	accountsSpending(userId: number): Promise<any> {
		const sql = `
      SELECT ${this.bankAccountTable}.id, ${this.bankAccountTable}.description, ${this.bankAccountTable}.bank, sum(case when transactions.amount > 0 and transactions.date_time > DATE_SUB(now(), INTERVAL 6 MONTH) then transactions.amount else 0 end) as spending FROM ${this.bankAccountTable}
      LEFT JOIN transactions ON
        ${this.bankAccountTable}.id = transactions.account_id
      WHERE ${this.bankAccountTable}.user_id = ?
      GROUP BY ${this.bankAccountTable}.id;
    `;

		return this.query({
			sql,
			values: [userId],
		});
	}

	monthSpending(userId: number): Promise<any> {
		const sql = `
    SELECT CONCAT(YEAR(transactions.date_time), '/', MONTH(transactions.date_time)) as month, sum(case when transactions.amount > 0 then transactions.amount else 0 end) as spending FROM ${this.bankAccountTable}
    LEFT JOIN transactions ON
      ${this.bankAccountTable}.id = transactions.account_id
    WHERE ${this.bankAccountTable}.user_id = ?
    and transactions.date_time > DATE_SUB(now(), INTERVAL 6 MONTH)
    GROUP BY YEAR(transactions.date_time), MONTH(transactions.date_time);
  `;

		return this.query({
			sql,
			values: [userId],
		});
	}
}