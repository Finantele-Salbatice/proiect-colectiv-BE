import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IAccountAdd } from 'src/requests/AccountAdd';
import { IBTCallback } from 'src/requests/BTCallback';
import { IBRDCallback } from 'src/requests/BRDCallback';
import { ISyncAccountRequest } from 'src/requests/SyncBankAccountRequest';
import { AccountService } from './account.service';
import { IBankAccount } from './models/Account';

@Controller('account')
export class AccountController {
	constructor(private readonly service: AccountService) {}

	@UseGuards(JwtAuthGuard)
	@Post('add')
	addAccount(@Request() req: IAccountAdd): Promise<string> {
		return this.service.addAcount(req.user.userId, req.body.bank);
	}

	@Post('btcallback')
	async btcallback(@Body() body: IBTCallback): Promise<void> {
		await this.service.handleBTCallback(body);
	}

	@Post('brdcallback')
	async brdcallback(@Body() body: IBRDCallback): Promise<void> {
		await this.service.handleBRDCallback(body);
	}

	@UseGuards(JwtAuthGuard)
	@Post('sync')
	async syncAccount(@Request() req: ISyncAccountRequest): Promise<void> {
		await this.service.syncBTAccount(req.body.accountId);
	}

  @UseGuards(JwtAuthGuard)
	@Post('list')
	async accountsList(@Request() req: ISyncAccountRequest): Promise<IBankAccount[]> {
		return this.service.getAllByUser(req.user.userId);
	}
}