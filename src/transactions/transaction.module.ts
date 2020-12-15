import { Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { AuthModule } from 'src/auth/auth.module';
import { TransactionService } from './transaction.service';
import { TransactionGateway } from './transaction.gateway';

@Module({
	providers: [TransactionService, TransactionGateway],
	exports: [TransactionService],
	imports: [SystemModule, AuthModule],
})
export class TransactionModule {}
