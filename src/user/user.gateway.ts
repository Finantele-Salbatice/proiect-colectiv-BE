
import { Database } from '../system/database';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { User } from './models/User';
import { Token } from './models/Token';

//doarfunctiilecarecomunicacubazadedate

@Injectable()
export class UserGateway extends Database {
	userTable: string;
	tokenTable: string;
	constructor(configProvider: ConfigProvider) {
		super(configProvider);
		this.userTable = 'users';
		this.tokenTable = 'tokens';
	}
	addUserInDB(user: User): Promise<any> {
		const sql = `
		INSERT INTO ${this.userTable} set ?;
		`;

		return this.query({
			sql,
			values: [user],
		});
	}
	findByUsername(username: string): Promise<any> {
		const sql = `
		SELECT * from ${this.userTable}
		WHERE email = ?;
		`;

		return this.query({
			sql,
			values: [username],
		});
	}

	findById(id: number): Promise<any> {
		const sql = `
		SELECT * from ${this.userTable}
		WHERE id = ?;
		`;

		return this.query({
			sql,
			values: [id],
		});
	}

	findByUsernameAndPassword(username: string, password: string): Promise<any> {
		const sql = `
		SELECT * from ${this.userTable}
		WHERE email = ? and password = ?;
		`;

		return this.query({
			sql,
			values: [username, password],
		});
	}

	addTokenInDB(t: Token): Promise<any> {
		const sql = `
		INSERT INTO ${this.tokenTable} set ?;
		`;

		return this.query({
			sql,
			values: [t],
		});
	}

	updateUser(user: User,id: number): Promise<any> {
		const sql = `
			UPDATE ${this.userTable} SET ? WHERE id = ?;
	`;

		return this.query({
			sql,
			values:[user,id],
		});
	}
	updateToken(token: Token,id: number): Promise<any> {
		const sql = `
			UPDATE ${this.tokenTable}
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
			SELECT * from ${this.tokenTable}
			WHERE token = ? and active = ? and type=?;
	`;

		return this.query({
			sql,
			values:[token,1,'reset'],
		});
	}

	updateUserActivation(id: string): Promise<any> {
		const sql = `
		UPDATE ${this.userTable} set active = 1 WHERE id = ?;
		`;

		return this.query({
			sql,
			values: [id],
		});
	}

	findTokenByToken(token: string): Promise<any> {
		const sql = `
		SELECT * from ${this.tokenTable}
		WHERE token = ?;
		`;

		return this.query({
			sql,
			values: [token],
		});
	}

}