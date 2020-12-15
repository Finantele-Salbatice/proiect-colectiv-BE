import { Module } from '@nestjs/common';
import { ConfigProvider } from './ConfigProvider';
import { Database } from './database';

@Module({
	providers: [Database, ConfigProvider],
	exports: [Database, ConfigProvider],
})
export class SystemModule {}
