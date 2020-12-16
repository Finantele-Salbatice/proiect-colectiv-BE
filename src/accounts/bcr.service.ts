import { Injectable, HttpService } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { AccountGateway } from './account.gateway';
import { EnumBankAccountStatus, EnumBanks } from './models/Oauth';
import { IBankAccount } from './models/Account';
import { AxiosRequestConfig } from 'axios';
import { IBCRCallback } from 'src/requests/BCRCallback';
import { stringify } from 'querystring';
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
		console.log(config.url);
		console.log(config.params);
		const url = ref.getUri(config);
		return url;
	}

	async getBCRAccounts(data: IBCROauthResponse): Promise<any> {
		const ref = this.httpService.axiosRef;
		const agent = this.BCRCertfs;
		try {
			const result = await ref.get(this.BCR_ACCOUNTS_URL, {
				httpsAgent: agent,
				headers: {
					authorization: `Bearer ${data.access_token}`,
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
	async getBCRBalance(data: IBCROauthResponse, resourceID: any): Promise<any> {
		const ref = this.httpService.axiosRef;
		const agent = this.BCRCertfs;
		try {
			const result = await ref.get(`${this.BCR_ACCOUNTS_URL}/${resourceID}/balances`, {
				httpsAgent: agent,
				headers: {
					authorization: `Bearer ${data.access_token}`,
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

	async handleBCRCallbackData(data: IBCROauthResponse, userId: number): Promise<void> {
		console.log(data);
		console.log(userId);
		const accounts = await this.getBCRAccounts(data);
		console.log(accounts);
		const balance = await this.getBCRBalance(data, '11e07590-27d4-409e-914b-c248fb945b11');
		console.log(balance);
		/*
		const time = new Date();
		time.setSeconds(time.getSeconds() + data.expires_in);
		const ref = this.httpService.axiosRef;
		const agent = this.BCRCertfs;
		try {
			const result = await ref.get(this.BCR_ACCOUNTS_URL, {
				httpsAgent: agent,
				headers: {
					authorization: `Bearer ${data.access_token}`,
					'x-request-id': v4(),
					'web-api-key': this.BCR_WEB_API_KEY,
				},
			});
			const data2 = result.data.accounts;
			const accounts: Record<string, IBankAccount> = {
			};
			const accArray = data2.values(accounts);
			await Promise.all(
				accArray.map(async acc => {
					const newId = await this.insertBankAccount(acc);
					await this.syncBCRAccount(newId);
				}));
			for (let i = 0; i < data2.length; i++) {
				const obj = data2[i];
				const account: IBankAccount = {
					account_id: obj.resourceId,
					iban: obj.iban,
					user_id: userId,
					access_token: data.access_token,
					refresh_token: data.refresh_token,
					bank: EnumBanks.BT,
				};
				accounts[i] = account;
			}

			//await Promise.all(
			//accArray.map(async acc => {
			//const newId = await this.insertBankAccount(acc);
			//await this.syncBCRAccount(newId);
			//}));
		} catch (err) {
			if (err.response) {
				console.log(err.response.data);
			} else {
				console.log(err);
			}
		}
		*/
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
		console.log('bodyyyy----',parms);

		const agent = this.BCRCertfs;
		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.post(this.BCR_TOKEN_URL, null,{
				httpsAgent: agent,
				params: parms,
			});
			const data = result.data;
			console.log('data--------', data);
			await this.handleBCRCallbackData(data, oauth.user_id);
		} catch (err) {
			console.log(err.response.data);
		}
	}

	async refreshBCROauthToken(accountId: number): Promise<string> {
		const account = await this.getAccountById(accountId);
		const body = {
			refresh_token: account.refresh_token,
			grant_type: 'refresh_token',
			redirect_uri: `${this.UI_HOST}/bcrsandbox`,
			client_id: this.BCR_CLIENT_ID,
			client_secret: this.BCR_CLIENT_SECRET,
		};
		const agent = this.BCRCertfs;
		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.post(this.BCR_TOKEN_URL, stringify(body), {
				httpsAgent: agent,
			});
			const data = result.data;
			const token = data.access_token;
			account.access_token = token;
			account.token_expires_at = moment().add(1, 'hour').toDate();
			await this.updateBankAccountById(account, account.id);
			return token;
		} catch (err) {
			console.log(err);
		}
	}

	async getBCRTransactionsByAccount(accountId: number): Promise<void> {
		const account = await this.getAccountById(accountId);
		const ref = this.httpService.axiosRef;

		const params: any = {
			bookingStatus: 'booked',
		};

		if (!account.transaction_see) {
			return;
		}

		if (account.synced_at && !moment().diff(account.synced_at, 'day')) {
			return;
		}
		if (account.synced_at && moment().diff(account.synced_at, 'day')) {
			params.dateFrom = moment(account.synced_at).add(1, 'day').format('YYYY-MM-DD');
		} else if (!account.synced_at) {
			params.dateFrom = moment().subtract(89, 'day').format('YYYY-MM-DD');
		}
		try {
			const result = await ref.get(`${this.BCR_ACCOUNTS_URL}/${account.account_id}/transactions`, {
				params,
				headers: {
					authorization: `Bearer ${account.access_token}`,
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
					details: trans.details,
				};
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
		const account = await this.getAccountById(accountId);
		if (moment(account.token_expires_at).isBefore(new Date())) {
			const token = await this.refreshBCROauthToken(account.id);
			account.access_token = token;
		}

		const ref = this.httpService.axiosRef;

		try {

			const result = await ref.get(this.BCR_ACCOUNTS_URL, {
				params: {
					withBalance: !!account.balance_see,
				},
				headers: {
					authorization: `Bearer ${account.access_token}`,
					'x-request-id': v4(),
					'web-api-key': this.BCR_WEB_API_KEY,
				},
			});
			const accounts: Array<any> = result.data.accounts;
			await Promise.all(accounts.map(async acc => {
				const iban = acc.iban;
				const update: IBankAccount = {
					currency: acc.currency,
					account_id: acc.resourceId,
					description: acc.name,
					additional_data: JSON.stringify(acc),
				};
				if (acc.balances) {
					const amount = acc.balances[0].balanceAmount.amount;
					update.balance = amount;
				}
				await this.gateway.updateBankAccountByIban(update, iban);
			}));
			await this.getBCRTransactionsByAccount(accountId);
		} catch (err) {
			if (err.response) {
				console.log(err.response.data);
			} else {
				console.log(err);
			}
		}
	}

}

