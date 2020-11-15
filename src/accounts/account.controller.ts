import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IAccountAdd } from 'src/requests/AccountAdd';
import { AccountService } from './account.service';

@Controller('/account')
export class AccountController {
	constructor(private readonly service: AccountService) {}
	@UseGuards(JwtAuthGuard)
	@Post('/add')
	addAccount(@Request() req: IAccountAdd): Promise<string> {
		return this.service.addAcount(req.user.userId, req.body.bank);
	}
}