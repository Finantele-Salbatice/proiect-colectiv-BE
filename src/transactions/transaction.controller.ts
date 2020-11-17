import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ITransactionsListRequest } from 'src/requests/TransactionsTestRequest';
import { StatisticsRequest } from 'src/requests/StatisticsRequest';
import { TransactionService } from './transaction.service';

@Controller('/transactions')
export class TransactionController {
	constructor(private readonly service: TransactionService) {}
	@UseGuards(JwtAuthGuard)
	@Post('/test')
	test(@Request() req: ITransactionsListRequest): void {
		console.log(req.body);
		console.log(req.user);
	}

	@Post('/statistics')
	tranzactionsList(@Body() body: StatisticsRequest): Promise<any> {
		console.log('controler');
		return this.service.lastTranzactions(body.lastDays);
	}

	@Post('/statisticsAmount')
	transactionAmount(@Body() body: StatisticsRequest): Promise<any> {
		console.log('controler');
		return this.service.lastTranzactionsAmount(body.lastDays);
	}
}