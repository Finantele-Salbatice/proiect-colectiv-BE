import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IAccountAdd } from 'src/requests/AccountAdd';
import { BRDRequest } from 'src/requests/AuthRequest';
import { IBTCallback } from 'src/requests/BTCallback';
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

	@Post('addBRD')
	addAccountBRD(@Request() req: BRDRequest): Promise<string> {
		console.log(req.body.userId);
		return this.service.addAcountBRD(req.body.userId);
	}

	@Post('btcallback')
	async btcallback(@Body() body: IBTCallback): Promise<void> {
		await this.service.handleBTCallback(body);
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