import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { TransactionGateway } from './transaction.gateway';

@Injectable()
export class TransactionService {
	constructor(private gateway: TransactionGateway, private configProvider: ConfigProvider) {}
	async lastTranzactions(nr: number): Promise<any> {
		console.log('service');
		const [result] = await this.gateway.getLastTranzactions(nr);
		if (!result) {
			throw new NotFoundException('Tranzactions not found!');
		}
		return result;
	}
	async lastTranzactionsAmount(nr: number): Promise<any>  {
		console.log('service2');
		const [result] = await this.gateway.getLastTranzactions(nr);
		let sum = 0;
		for (const t of result) {
			console.log(t);
			sum += t.amount;
		}
		if (sum !== 0) {
			throw new NotFoundException('Tranzactions amount not found!');
		}
		return sum;
	}
}