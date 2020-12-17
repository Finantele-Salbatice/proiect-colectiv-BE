import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IAccountAdd } from 'src/requests/AccountAdd';
import { IBCRCallback } from 'src/requests/BCRCallback';
import { IBTCallback } from 'src/requests/BTCallback';
import { ISyncAccountRequest } from 'src/requests/SyncBankAccountRequest';
import { AccountCoordinator } from './account.coordinator';
import { AccountService } from './account.service';
import { BcrService } from './bcr.service';
import { BrdService } from './brd.service';
import { BtService } from './bt.service';
import { IBankAccount } from './models/Account';

@Controller('account')
export class AccountController {
	constructor(private readonly service: AccountService, private readonly serviceBRD: BrdService,
    private coordinator: AccountCoordinator, private btService: BtService, private bcrService: BcrService) {}

	@UseGuards(JwtAuthGuard)
	@Post('add')
	addAccount(@Request() req: IAccountAdd): Promise<string> {
		return this.coordinator.addAcount(req.user.userId, req.body.bank);
	}

	@Post('btcallback')
	async btcallback(@Body() body: IBTCallback): Promise<void> {
		await this.btService.handleBTCallback(body);
	}
	@Post('bcrcallback')
	async bcrcallback(@Body() body: IBCRCallback): Promise<void> {
		await this.bcrService.handleBCRCallback(body);
	}

	@UseGuards(JwtAuthGuard)
	@Post('btsync')
	async syncAccount(@Request() req: ISyncAccountRequest): Promise<void> {
		await this.btService.syncBTAccount(req.body.accountId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('bcrsync')
	async syncBCRAccount(@Request() req: ISyncAccountRequest): Promise<void> {
		await this.bcrService.syncBCRAccount(req.body.accountId);
	}

  @UseGuards(JwtAuthGuard)
	@Post('list')
	async accountsList(@Request() req: ISyncAccountRequest): Promise<IBankAccount[]> {
		return this.service.getAllByUser(req.user.userId);
	}
}