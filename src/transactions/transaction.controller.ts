import { Controller, Post, Request, UseGuards } from '@nestjs/common';
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

	@UseGuards(JwtAuthGuard)
	@Post('/statistics')
	tranzactionsList(@Request() req: StatisticsRequest): Promise<any> {
		return this.service.lastTransactions(req.body.lastDays, req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('/statisticsAmount')
	transactionAmount(@Request() req: StatisticsRequest): Promise<any> {
		return this.service.lastTransactionsAmount(req.body.lastDays, req.user.userId);
	}
}