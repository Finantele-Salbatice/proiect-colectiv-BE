import { Injectable } from '@nestjs/common';
import { IConfig } from './Config';
import { config } from 'dotenv';

@Injectable()
export class ConfigProvider {
	private config: IConfig;
	constructor() {
		config();
		this.config = process.env as any as IConfig;
	}

	getConfig(): IConfig {
		return this.config;
	}
}