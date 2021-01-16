import { Module } from '@nestjs/common';
import { SystemModule } from './system/system.module';
import { TransactionController } from './transactions/transaction.controller';
import { TransactionModule } from './transactions/transaction.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { AccountModule } from './accounts/account.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [SystemModule, UserModule, TransactionModule, AccountModule, ServeStaticModule.forRoot({
		rootPath: join(__dirname, '..', 'public'),
		serveRoot: '/public',
	}), ServeStaticModule.forRoot({
		rootPath: join(__dirname, '..', 'documentation'),
		serveRoot: '/documentation',
	})],
	controllers: [UserController, TransactionController],
})
export class AppModule {}
