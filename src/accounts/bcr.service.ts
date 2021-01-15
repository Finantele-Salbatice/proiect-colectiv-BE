import { Injectable, HttpService } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { AccountGateway } from './account.gateway';
import { EnumBankAccountStatus, EnumBanks } from './models/Oauth';
import { IBankAccount } from './models/Account';
import { AxiosRequestConfig } from 'axios';
import { BCRCallback } from 'src/requests/BCRCallback';
import { IOauth } from './models/Oauth';
import { IBCROauthResponse } from './models/BCROauth';
import * as moment from 'moment';
import { v4 } from 'uuid';
import { TransactionService } from 'src/transactions/transaction.service';
import { ITransaction } from 'src/transactions/models/Transactions';
import { AccountService } from './account.service';
import { Agent } from 'https';
import { readFileSync } from 'fs';

@Injectable()
export class BcrService extends AccountService  {
	constructor( gateway: AccountGateway,  configProvider: ConfigProvider,  httpService: HttpService,  transactionService: TransactionService) {
		super(gateway, configProvider, httpService, transactionService);
	}

	async addAcount(userId: number, bank: EnumBanks): Promise<string> {
		if (bank === EnumBanks.BCR) {
			return this.createBCROauth(userId);
		}

	}

	get UI_HOST(): string {
		return this.configProvider.getConfig().UI_HOST;
	}

	get BCR_CLIENT_ID(): string {
		return this.configProvider.getConfig().BCR_CLIENT_ID;
	}
	get BCR_FORM_URL(): string {
		return this.configProvider.getConfig().BCR_FORM_URL;
	}
	get BCR_CLIENT_SECRET(): string {
		return this.configProvider.getConfig().BCR_CLIENT_SECRET;
	}
	get BCR_TOKEN_URL(): string {
		return this.configProvider.getConfig().BCR_TOKEN_URL;
	}
	get BCR_WEB_API_KEY(): string {
		return this.configProvider.getConfig().BCR_WEB_API_KEY;
	}
	get BCR_ACCOUNTS_URL(): string {
		return this.configProvider.getConfig().BCR_ACCOUNTS_URL;
	}
	get BCR_FINGERPRINT(): string {
		return this.configProvider.getConfig().BCR_FINGERPRINT;
	}

	get BCRCertfs(): Agent {
		const httpsAgent = new Agent({
			rejectUnauthorized: false, // (NOTE: this will disable client verification)
			cert: readFileSync('public/public-key.pem'),
			key: readFileSync('public/private-key.key'),
			passphrase: this.BCR_FINGERPRINT,
		});
		return httpsAgent;
	}

	async createBCROauth(userId: number): Promise<string> {
		const acc: IOauth = {
			user_id: userId,
			bank: EnumBanks.BCR,
			status: EnumBankAccountStatus.inProgess,
		};
		const result = await this.gateway.addOauth(acc);
		acc.id = result.insertId;
		return this.createBCRForm(acc);
	}

	createBCRForm(acc: IBankAccount): string {
		const ref = this.httpService.axiosRef;
		const config: AxiosRequestConfig = {
			url: this.BCR_FORM_URL,
			params: {
				response_type: 'code',
				access_type: 'offline',
				client_id: this.BCR_CLIENT_ID,
				redirect_uri: `${this.UI_HOST}/bcrsandbox`,
				state: acc.id,
			},
		};
		const url = ref.getUri(config);
		return url;
	}

	async handleBCRCallback(request: BCRCallback): Promise<void> {
		const id = +request.state;
		const oauth = await this.getOauthById(id);
		const parms = {
			code: decodeURIComponent(request.code),
			grant_type: 'authorization_code',
			redirect_uri: `${this.UI_HOST}/bcrsandbox`,
			client_id: this.BCR_CLIENT_ID,
			client_secret: this.BCR_CLIENT_SECRET,
		};
		const agent = this.BCRCertfs;
		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.post(this.BCR_TOKEN_URL, null,{
				httpsAgent: agent,
				params: parms,
			});
			const data = result.data;
			const d = new Date();
			d.setSeconds(d.getSeconds() + 360);
			const oauthUpdate: IOauth = {
				user_id: oauth.user_id,
				bank: oauth.bank,
				status: oauth.status,
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				token_expires_at: d,
			};
			await this.updateOauthById(oauthUpdate, id);
			await this.handleBCRCallbackData(data, oauth.user_id, oauth.id);
		} catch (err) {
			if (err.response) {
				throw new Error(err.response.data);
			}
			throw err;
		}
	}
	async saveTransactions(accesToken: string, accountId: number, userId: string): Promise<any> {
		const rawTransactions = await this.getBCRTransactions(accesToken, userId);
		const transactions = rawTransactions.transactions.booked;
		await Promise.all(
			transactions.map(async trans => {
				const insertTransaction: ITransaction = {
					account_id: accountId,
					raw_data: JSON.stringify(trans),
					amount: trans.transactionAmount.amount,
					currency: trans.transactionAmount.currency,
					transaction_id: trans.transactionId,
					beneficiary: trans.creditorName,
					date_time: trans.valueDate,
					details: trans.remittanceInformationUnstructured,
					created_at: new Date(),
				};
				await this.transactionService.insertTransaction(insertTransaction);
			}));
	}

	async handleBCRCallbackData(data: IBCROauthResponse, userId: number, oauthId: number): Promise<void> {
		const rawaccounts = await this.getBCRAccounts(data.access_token);
		const accounts = rawaccounts.accounts;
		const userAccounts: Record<string, IBankAccount> = {
		};
		await Promise.all(
			accounts.map(async acc => {
				const rawbalance = await this.getBCRBalance(data.access_token, acc.resourceId);
				const balances = rawbalance.balances;
				const firstbalance = balances[0].balanceAmount;
				const userAccount: IBankAccount = {
					user_id: userId,
					oauth_id: oauthId,
					bank: EnumBanks.BCR,
					account_id: acc.resourceId,
					iban: acc.iban,
					description: acc.details,
					balance:firstbalance.amount,
					currency: firstbalance.currency,
					transaction_see: acc.iban,
					balance_see: acc.iban,
					synced_at: new Date(),
					additional_data: JSON.stringify(acc),
				};
				userAccounts[userAccount.account_id] = userAccount;
			}));
		const accArray = Object.values(userAccounts);
		await Promise.all(
			accArray.map(async acc => {
				const newId = await this.insertBankAccount(acc);
				if (newId) {
					await this.saveTransactions(data.access_token, newId, acc.account_id);
				}
			}));
	}

	async getBCRAccounts(accesToken: string): Promise<any> {
		const ref = this.httpService.axiosRef;
		const agent = this.BCRCertfs;
		try {
			const result = await ref.get(this.BCR_ACCOUNTS_URL, {
				httpsAgent: agent,
				headers: {
					authorization: `Bearer ${accesToken}`,
					'x-request-id': v4(),
					'web-api-key': this.BCR_WEB_API_KEY,
				},
			});
			return result.data;
		} catch (err) {
			if (err.response) {
				throw new Error(err.response.data);
			}
			throw err;
		}
	}
	async getBCRBalance(accesToken: string, resourceID: any): Promise<any> {
		const ref = this.httpService.axiosRef;
		const agent = this.BCRCertfs;
		try {
			const result = await ref.get(`${this.BCR_ACCOUNTS_URL}/${resourceID}/balances`, {
				httpsAgent: agent,
				headers: {
					authorization: `Bearer ${accesToken}`,
					'x-request-id': v4(),
					'web-api-key': this.BCR_WEB_API_KEY,
				},
			});
			return result.data;
		} catch (err) {
			if (err.response) {
				throw new Error(err.response.data);
			}
			throw err;
		}
	}
	async getBCRTransactions(accesToken: string, resourceId: any): Promise<any> {
		const ref = this.httpService.axiosRef;
		const agent = this.BCRCertfs;
		try {
			const result = await ref.get(`${this.BCR_ACCOUNTS_URL}/${resourceId}/transactions`, {
				httpsAgent: agent,
				headers: {
					authorization: `Bearer ${accesToken}`,
					'x-request-id': v4(),
					'web-api-key': this.BCR_WEB_API_KEY,
				},
			});
			return result.data;
		} catch (err) {
			if (err.response) {
				throw new Error(err.response.data);
			}
			throw err;
		}
	}
	async refreshBCROauthToken(accountId: number): Promise<string> {
		const oauth = await this.getOauthByAccountId(accountId);
		const parms = {
			grant_type: 'refresh_token',
			client_id: this.BCR_CLIENT_ID,
			client_secret: this.BCR_CLIENT_SECRET,
			refresh_token: oauth.refresh_token,
		};
		const agent = this.BCRCertfs;
		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.post(this.BCR_TOKEN_URL, null,{
				httpsAgent: agent,
				params: parms,
			});
			const data = result.data;
			const token = data.access_token;
			const d = new Date();
			d.setSeconds(d.getSeconds() + 360);
			oauth.access_token = token;
			oauth.token_expires_at = d;
			await this.updateOauthById(oauth, oauth.id);
			return token;
		} catch (err) {
			if (err.response) {
				throw new Error(err.response.data);
			}
			throw err;
		}
	}
	async syncBCRAccount(accountId: number): Promise<void> {
		const oauth = await this.getOauthByAccountId(accountId);
		if (moment(oauth.token_expires_at).isBefore(new Date())) {
			await this.refreshBCROauthToken(accountId);
		}
		const data = await this.getOauthByAccountId(accountId);
		const acc = await this.getAccountById(accountId);
		const iban = acc.iban;
		const rawbalance = await this.getBCRBalance(data.access_token, acc.account_id);
		const balances = rawbalance.balances;
		const firstbalance = balances[0].balanceAmount;
		acc.balance = firstbalance.amount;
		acc.currency = firstbalance.currency;
		await this.gateway.updateBankAccountByIban(acc, iban);
		await this.saveTransactions(data.access_token, accountId, acc.account_id);
	}
}