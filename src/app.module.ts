import { Module } from '@nestjs/common';
import { SystemModule } from './system/system.module';
import { TransactionController } from './transactions/transaction.controller';
import { TransactionModule } from './transactions/transaction.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';

@Module({
	imports: [SystemModule, UserModule, TransactionModule],
	controllers: [UserController, TransactionController],
})
export class AppModule {}
