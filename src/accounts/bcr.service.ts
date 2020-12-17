import { Injectable, HttpService } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { AccountGateway } from './account.gateway';
import { EnumBankAccountStatus, EnumBanks } from './models/Oauth';
import { IBankAccount } from './models/Account';
import { AxiosRequestConfig } from 'axios';
import { IBCRCallback } from 'src/requests/BCRCallback';
import { IOauth } from './models/Oauth';
import { IBCROauthResponse } from './models/BCROauth';
//import * as moment from 'moment';
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

	async handleBCRCallback(request: IBCRCallback): Promise<void> {
		const id = +request.state;
		const oauth = await this.getOauthById(id);
		const parms = {
			code: request.code,
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
			await this.handleBCRCallbackData(data, oauth.user_id, oauth.id);
		} catch (err) {
			console.log(err.response.data);
		}
	}
	async saveTransactions(data: IBCROauthResponse, accountId: number, userId: string): Promise<any> {
		const rawTransactions = await this.getBCRTransactions(data.access_token, userId);
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
				console.log(insertTransaction);
				await this.transactionService.insertTransaction(insertTransaction);
			}));
	}

	async handleBCRCallbackData(data: IBCROauthResponse, userId: number, oauthId: number): Promise<void> {
		console.log(data);
		console.log(userId);
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
					await this.saveTransactions(data, newId, acc.account_id);
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
			console.log(result.data);
			return result.data;
		} catch (err) {
			if (err.response) {
				console.log(err.response.data);
			} else {
				console.log(err);
			}
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
				console.log(err.response.data);
			} else {
				console.log(err);
			}
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
				console.log(err.response.data);
			} else {
				console.log(err);
			}
		}
	}
	async refreshBCROauthToken(accountId: number): Promise<string> {
		const account = await this.getAccountById(accountId);
		const parms = {
			//refresh_token: account.refresh_token,
			grant_type: 'refresh_token',
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
			const token = data.access_token;
			//account.access_token = token;
			//account.token_expires_at = moment().add(300, 'seconds').toDate();
			await this.updateBankAccountById(account, account.id);
			return token;
		} catch (err) {
			console.log(err.response.data);
		}
	}

	async getBCRTransactionsByAccount(accountId: number, accesToken: string): Promise<void> {
		const account = await this.getAccountById(accountId);
		const ref = this.httpService.axiosRef;
		const agent = this.BCRCertfs;
		try {
			const result = await ref.get(`${this.BCR_ACCOUNTS_URL}/${account.account_id}/transactions`, {
				httpsAgent: agent,
				headers: {
					authorization: `Bearer ${accesToken}`,
					'x-request-id': v4(),
					'web-api-key': this.BCR_WEB_API_KEY,
				},
			});
			const transactions = result.data.transactions.booked;
			await Promise.all(transactions.map(async trans => {
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
				console.log(insertTransaction);
				await this.transactionService.insertTransaction(insertTransaction);
			}));
			await this.updateBankAccountById({
				synced_at: new Date(),
			}, accountId);
		} catch (err) {
			if (err.response) {
				console.log(err.response.data);
			} else {
				console.log(err);
			}
		}
	}

	async syncBCRAccount(accountId: number): Promise<void> {
		console.log('am intrat in sync');
		//const account = await this.getAccountById(accountId);
		// if (moment(account.token_expires_at).isBefore(new Date())) {
		// 	console.log('se face refresh');
		// 	const token = await this.refreshBCROauthToken(account.id);
		// 	account.access_token = token;
		// 	console.log('s-a facut refresh');
		// }
		console.log('obtinem accestoken si conturi');
		const data = await this.getOauthById(accountId);
		console.log('data pentru token', data);
		const rawaccounts = await this.getBCRAccounts(data.access_token);
		const accounts = rawaccounts.accounts;
		await Promise.all(accounts.map(async acc => {
			const iban = acc.iban;
			const rawbalance = await this.getBCRBalance(data.access_token, acc.resourceId);
			const balances = rawbalance.balances;
			const firstbalance = balances[0].balanceAmount;
			const update: IBankAccount = {
				currency: firstbalance.currency,
				account_id: acc.resourceId,
				description: acc.description,
				additional_data: JSON.stringify(acc),
			};
			const amount = firstbalance.amount;
			update.balance = amount;
			await this.gateway.updateBankAccountByIban(update, iban);
		}));
		await this.getBCRTransactionsByAccount(accountId, data.access_token);
	}
}