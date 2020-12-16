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
			cert: readFileSync('./public-key.pem'),
			key: readFileSync('./private-key.pem'),
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

	async handleBCRCallbackData(data: IBCROauthResponse, userId: number): Promise<void> {
		const accountsCount = +data.accounts_count;
		const transactionsCount = +data.transactions_count;
		const balancesCount = +data.balances_count;
		const accounts: Record<string, IBankAccount> = {
		};
		for (let i = 0; i < accountsCount; i++) {
			const account: IBankAccount = {
				user_id: userId,
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				bank: EnumBanks.BCR,
			};
			const currentAcc = `accounts_${i}`;
			const accountId = data[currentAcc];
			account.iban = accountId;
			accounts[accountId] = account;
		}

		for (let i = 0; i < transactionsCount; i++) {
			const account: IBankAccount = {
				user_id: userId,
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				bank: EnumBanks.BCR,
			};
			const currentTran = `transactions_${i}`;
			const accountId = data[currentTran];
			if (accounts[accountId]) {
				accounts[accountId].transaction_see = accountId;
				continue;
			}
			account.iban = accountId;
			account.transaction_see = accountId;
			accounts[accountId] = account;
		}

		for (let i = 0; i < balancesCount; i++) {
			const account: IBankAccount = {
				user_id: userId,
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				bank: EnumBanks.BCR,
			};
			const currentBalance = `balances_${i}`;
			const accountId = data[currentBalance];
			if (accounts[accountId]) {
				accounts[accountId].balance_see = accountId;
				continue;
			}
			account.iban = accountId;
			account.balance_see = accountId;
			accounts[accountId] = account;
		}

		const accArray = Object.values(accounts);

		await Promise.all(
			accArray.map(async acc => {
				const newId = await this.insertBankAccount(acc);
				await this.syncBCRAccount(newId);
			}));
	}

	async handleBCRCallback(request: IBCRCallback): Promise<void> {
		const id = +request.state;
		const oauth = await this.getOauthById(id);
		const body = {
			code: request.code,
			grant_type: 'authorization_code',
			redirect_uri: `${this.UI_HOST}bcrsandbox`,
			client_id: this.BCR_CLIENT_ID,
			client_secret: this.BCR_CLIENT_SECRET,
		};
		console.log('oauth------',oauth);
		console.log('bodyyyy----',body);

		//const Agent = this.BCRCertfs;
		console.log(Agent);
		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.post(this.BCR_TOKEN_URL, stringify(body), {

			});
			const data = result.data;
			console.log('data--------', data);
			await this.handleBCRCallbackData(data, oauth.user_id);
		} catch (err) {
			console.log(err);
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

		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.post(this.BCR_TOKEN_URL, stringify(body), {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
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

