import { HttpModule, Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { AuthModule } from 'src/auth/auth.module';
import { AccountService } from './account.service';
import { BrdService } from './brd.service';
import { AccountGateway } from './account.gateway';
import { TransactionModule } from 'src/transactions/transaction.module';
import { BtService } from './bt.service';
import { AccountCoordinator } from './account.coordinator';
import { AccountController } from './account.controller';

@Module({
	providers: [AccountService, BrdService, AccountGateway, BtService, AccountCoordinator],
	exports: [AccountService, BrdService],
	imports: [SystemModule, AuthModule, HttpModule, TransactionModule],
	controllers: [AccountController],
})
export class AccountModule {}
