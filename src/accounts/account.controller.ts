import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AccountAdd } from 'src/requests/AccountAdd';
import { AuthRequest } from 'src/requests/AuthRequest';
import { BCRCallback } from 'src/requests/BCRCallback';
import { BTCallback } from 'src/requests/BTCallback';
import { SyncAccountBody } from 'src/requests/SyncBankAccountRequest';
import { AccountCoordinator } from './account.coordinator';
import { AccountService } from './account.service';
import { BcrService } from './bcr.service';
import { BrdService } from './brd.service';
import { BtService } from './bt.service';
import { IBankAccount } from './models/Account';

@ApiBearerAuth()
@Controller('account')
export class AccountController {
	constructor(private readonly service: AccountService, private readonly serviceBRD: BrdService,
		private coordinator: AccountCoordinator, private btService: BtService, private bcrService: BcrService) {}

	@UseGuards(JwtAuthGuard)
	@Post('add')
	addAccount(@Request() req: AuthRequest, @Body() body: AccountAdd): Promise<string> {
		return this.coordinator.addAcount(req.user.userId, body.bank);
	}

	@Post('btcallback')
	async btcallback(@Body() body: BTCallback): Promise<void> {
		await this.btService.handleBTCallback(body);
	}
	@Post('bcrcallback')
	async bcrcallback(@Body() body: BCRCallback): Promise<void> {
		await this.bcrService.handleBCRCallback(body);
	}

	@UseGuards(JwtAuthGuard)
	@Post('btsync')
	async syncAccount(@Body() body: SyncAccountBody): Promise<void> {
		await this.btService.syncBTAccount(body.accountId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('bcrsync')
	async syncBCRAccount(@Body() body: SyncAccountBody): Promise<void> {
		await this.bcrService.syncBCRAccount(body.accountId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('list')
	async accountsList(@Request() req: AuthRequest): Promise<IBankAccount[]> {
		return this.service.getAllByUser(req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('reports')
	async accountsSpending(@Request() req: AuthRequest): Promise<IBankAccount[]> {
		return this.service.accountsSpending(req.user.userId);
	}
}