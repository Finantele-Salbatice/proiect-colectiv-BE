import { Injectable } from '@nestjs/common';
import { IConfig } from './Config';

@Injectable()
export class ConfigProvider {
	config: IConfig;
	constructor() {
		this.config = process.env as any as IConfig;
	}

	getConfig(): IConfig {
		return this.config;
	}
}