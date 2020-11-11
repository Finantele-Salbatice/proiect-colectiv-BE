
import { Database } from '../system/database';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { User } from './models/User';
import { Token } from './models/Token';

//doarfunctiilecarecomunicacubazadedate

@Injectable()
export class UserGateway extends Database {
	table: string;
	token: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.table = 'users';
		this.token = 'tokens';
	}
	addUserInDB(user: User): Promise<any> {
		const sql = `
		INSERT INTO ${this.table} set ?;
		`;

		return this.query({
			sql,
			values: [user],
		});
	}
	findByUsername(username: string): Promise<any> {
		const sql = `
		SELECT * from ${this.table}
		WHERE email = ?;
		`;

		return this.query({
			sql,
			values: [username],
		});
	}

	findById(id: number): Promise<any> {
		const sql = `
		SELECT * from ${this.table}
		WHERE id = ?;
		`;

		return this.query({
			sql,
			values: [id],
		});
	}

	findByUsernameAndPassword(username: string, password: string): Promise<any> {
		const sql = `
		SELECT * from ${this.table}
		WHERE email = ? and password = ?;
		`;

		return this.query({
			sql,
			values: [username, password],
		});
	}

	addTokenInDB(t: Token): Promise<any> {
		const sql = `
		INSERT INTO ${this.token} set ?;
		`;

		return this.query({
			sql,
			values: [t],
		});
	}

	updateUser(user: User,id: number): Promise<any> {
		const sql = `
			UPDATE ${this.table} SET ? WHERE id = ?;
	`;

		return this.query({
			sql,
			values:[user,id],
		});
	}
	updateToken(token: Token,id: number): Promise<any> {
		const sql = `
			UPDATE${this.token}
			SET ?
			WHERE id = ?;
	`;

		return this.query({
			sql,
			values:[token,id],
		});
	}

	findResetToken(token: string): Promise<any> {
		const sql = `
			SELECT * from ${this.token}
			WHERE token = ? and active = ? and type=?;
	`;

		return this.query({
			sql,
			values:[token,1,'reset'],
		});
	}

}