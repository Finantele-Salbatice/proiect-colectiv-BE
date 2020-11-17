import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ITransactionsListRequest } from 'src/requests/TransactionsTestRequest';
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
	@Post('/filter')
	filter(@Request() req: ITransactionsListRequest): Promise<any> {
		console.log(req.body);
		console.log(req.user);
		return this.service.filterTransactions(req.body, req.user);
	}
}