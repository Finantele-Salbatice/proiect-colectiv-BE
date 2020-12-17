import { Injectable, HttpService, NotFoundException } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { AccountGateway } from './account.gateway';
import { IBankAccount } from './models/Account';
import { createHash } from 'crypto';
import { IOauth } from './models/Oauth';
import { TransactionService } from 'src/transactions/transaction.service';
@Injectable()
export class AccountService {
	gateway: AccountGateway;
	configProvider: ConfigProvider;
	httpService: HttpService;
	transactionService: TransactionService;
	constructor(gateway: AccountGateway, configProvider: ConfigProvider, httpService: HttpService, transactionService: TransactionService) {
		this.gateway = gateway;
		this.configProvider = configProvider;
		this.httpService = httpService;
		this.transactionService = transactionService;
	}

	get UI_HOST(): string {
		return this.configProvider.getConfig().UI_HOST;
	}

	base64URLEncode(str: Buffer): string {
		return str.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=/g, '');
	}

	/**
	 *
	 * @param account
	 * @returns inserted entity id
	 */
	async insertBankAccount(account: IBankAccount): Promise<number> {
		const result = await this.gateway.addAccount(account);
		return result.insertId;
	}

	sha256(buffer: string): Buffer {
		return createHash('sha256').update(buffer).digest();
	}

	async getAccountById(id: number): Promise<IBankAccount> {
		const [result] = await this.gateway.getAccountById(id);
		if (!result) {
			throw new NotFoundException('Account not found!');
		}
		return result;
	}

	async getOauthByAccountId(accountId: number): Promise<IOauth> {
		const [result] = await this.gateway.getOauthByAccountId(accountId);
		return result;
	}

	async getOauthById(id: number): Promise<IOauth> {
		const [result] = await this.gateway.getOauthById(id);
		if (!result) {
			throw new NotFoundException('Oauth not found!');
		}
		return result;
	}

	async updateBankAccountById(bankAccount: IBankAccount, id: number): Promise<void> {
		await this.gateway.updateBankAccountById(bankAccount, id);
	}

	async updateOauthById(oauth: IOauth, id: number): Promise<void> {
		await this.gateway.updateOauthById(oauth, id);
	}

	async getAllByUser(userId: number): Promise<IBankAccount[]> {
		const results = await this.gateway.getAccountsByUser(userId);
		return results;
	}
}

