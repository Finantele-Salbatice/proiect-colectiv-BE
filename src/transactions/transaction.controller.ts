import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransactionsListFilters } from 'src/requests/TransactionsListRequest';
import { StatisticsRequestFilter } from 'src/requests/StatisticsRequest';
import { TransactionService } from './transaction.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthRequest } from 'src/requests/AuthRequest';

@ApiBearerAuth()
@Controller('transactions')
export class TransactionController {
	constructor(private readonly service: TransactionService) {}

	@UseGuards(JwtAuthGuard)
	@Post('list')
	filter(@Request() req: AuthRequest, @Body() body: TransactionsListFilters): Promise<any> {
		return this.service.filterTransactions(body, req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('statistics')
	transactionList(@Request() req: AuthRequest, @Body() body: StatisticsRequestFilter): Promise<any> {
		return this.service.lastTransactions(body.lastDays, req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('statisticsAmount')
	transactionAmount(@Request() req: AuthRequest, @Body() body: StatisticsRequestFilter): Promise<any> {
		return this.service.lastTransactionsAmount(body.lastDays, req.user.userId);
	}
}