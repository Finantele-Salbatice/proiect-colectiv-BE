import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
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
	@Get('list')
	filter(@Request() req: AuthRequest, @Query() body: TransactionsListFilters): Promise<any> {
		return this.service.filterTransactions(body, req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('statistics')
	transactionList(@Request() req: AuthRequest, @Query() body: StatisticsRequestFilter): Promise<any> {
		return this.service.lastTransactions(body.lastDays, req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('statisticsAmount')
	transactionAmount(@Request() req: AuthRequest, @Query() body: StatisticsRequestFilter): Promise<any> {
		return this.service.lastTransactionsAmount(body.lastDays, req.user.userId);
	}
}