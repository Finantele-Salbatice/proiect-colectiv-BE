import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { ITransaction } from './models/Transactions';
import { TransactionGateway } from './transaction.gateway';

@Injectable()
export class TransactionService {
	constructor(private gateway: TransactionGateway, private configProvider: ConfigProvider) {
	}

	async insertTransaction(transaction: ITransaction): Promise<any> {
		await this.gateway.insertTransaction(transaction);
	}
}

