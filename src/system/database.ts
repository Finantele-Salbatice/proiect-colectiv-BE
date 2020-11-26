import { createPool, Pool, PoolConfig, PoolConnection, QueryOptions } from 'mysql';
import { IConfig } from './Config';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from './ConfigProvider';
import * as Knex from 'knex';

const dbConfig = (env: IConfig): PoolConfig => ({
	host: env.DB_HOST,
	port: +env.DB_PORT,
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	database: env.DB_DATABASE,
	timezone: env.DB_TIMEZONE,
	connectionLimit: +env.DB_CONNECTION_LIMIT,
	connectTimeout: +env.DB_CONNECTION_TIMEOUT,
	acquireTimeout: +env.DB_ACQUIRE_TIMEOUT,
	multipleStatements: env.DB_MULTIPLE_STATEMENTS,
});

@Injectable()
export class Database {
	private connection: Pool;
	private knex: Knex;
	constructor(private configProvider: ConfigProvider) {
		const conf = dbConfig(this.configProvider.getConfig());
		this.connection = createPool(conf);
		this.knex = Knex({
			client: 'mysql',
		});
	}
	get queryBuilder(): Knex {
		return this.knex;
	}

	async getConnection(): Promise<PoolConnection> {
		return new Promise((resolve, reject) => {
			this.connection.getConnection((err, connection) => {
				if (err) {
					return reject(err);
				}
				resolve(connection);
			});
		});
	}
	async query(options: QueryOptions): Promise<any> {
		const conn = await this.getConnection();
		const promise = new Promise((resolve, reject) => {
			conn.query(options, (err, result) => {
				if (err) {
					conn.release();
					return reject(err);
				}
				conn.release();
				return resolve(result);
			});
		});
		return promise;
	}

}

