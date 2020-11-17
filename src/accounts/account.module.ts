import { HttpModule, Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { AuthModule } from 'src/auth/auth.module';
import { AccountService } from './account.service';
import { AccountGateway } from './account.gateway';
import { TransactionModule } from 'src/transactions/transaction.module';

@Module({
	providers: [AccountService, AccountGateway],
	exports: [AccountService],
	imports: [SystemModule, AuthModule, HttpModule, TransactionModule],
})
export class AccountModule {}
