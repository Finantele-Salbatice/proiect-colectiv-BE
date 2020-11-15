import { Module } from '@nestjs/common';
import { SystemModule } from './system/system.module';
import { TransactionController } from './transactions/transaction.controller';
import { TransactionModule } from './transactions/transaction.module';
import { UserController } from './user/user.controller';
import { AccountController } from './accounts/account.controller';
import { UserModule } from './user/user.module';
import { AccountModule } from './accounts/account.module';

@Module({
	imports: [SystemModule, UserModule, TransactionModule, AccountModule],
	controllers: [UserController, TransactionController, AccountController],
})
export class AppModule {}
