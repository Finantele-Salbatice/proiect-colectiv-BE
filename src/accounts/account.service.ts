import { Injectable, HttpService, NotFoundException } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { AccountGateway } from './account.gateway';
import { EnumBankAccountStatus, EnumBanks, IBankAccount } from './models/Account';
import { randomBytes, createHash } from 'crypto';
import { AxiosRequestConfig } from 'axios';
import { IBTCallback } from 'src/requests/BTCallback';
import { stringify } from 'querystring';
import { IOauth } from './models/Oauth';
import { IBTOauthResponse } from './models/BTOauth';
import { IBCROauthResponse } from './models/BCROauth';
import * as moment from 'moment';
import { v4 } from 'uuid';
import { TransactionService } from 'src/transactions/transaction.service';
import { ITransaction } from 'src/transactions/models/Transactions';

@Injectable()
export class AccountService {
	constructor(private gateway: AccountGateway, private configProvider: ConfigProvider, private httpService: HttpService, private transactionService: TransactionService) {
	}

	async addAcount(userId: number, bank: EnumBanks): Promise<string> {
		if (bank === EnumBanks.BT) {
			return this.createBTOauth(userId);
		}
		if (bank === EnumBanks.BCR) {
			return this.createBCROauth(userId);
		}

	}

	get BT_CLIENT_SECRET(): string {
		return this.configProvider.getConfig().BT_CLIENT_SECRET;
	}

	get BT_FORM_URL(): string {
		return this.configProvider.getConfig().BT_FORM_URL;
	}

	get BT_CLIENT_ID(): string {
		return this.configProvider.getConfig().BT_CLIENT_ID;
	}

	get BT_CONSENT_ID(): string {
		return this.configProvider.getConfig().BT_CONSENT_ID;
	}

	get UI_HOST(): string {
		return this.configProvider.getConfig().UI_HOST;
	}

	get BT_TOKEN_URL(): string {
		return this.configProvider.getConfig().BT_TOKEN_URL;
	}

	get BT_ACCOUNTS_URL(): string {
		return this.configProvider.getConfig().BT_ACCOUNTS_URL;
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

	base64URLEncode(str: Buffer): string {
		return str.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=/g, '');
	}

	async createBTOauth(userId: number): Promise<string> {
		const verifier = this.base64URLEncode(randomBytes(32));
		const acc: IOauth = {
			user_id: userId,
			bank: EnumBanks.BT,
			status: EnumBankAccountStatus.inProgess,
			code_verifier: verifier,
		};
		const result = await this.gateway.addOauth(acc);
		acc.id = result.insertId;
		return this.createBTForm(acc);
	}

	async createBCROauth(userId: number): Promise<string> {
		const verifier = this.base64URLEncode(randomBytes(32));
		const acc: IOauth = {
			user_id: userId,
			bank: EnumBanks.BCR,
			status: EnumBankAccountStatus.inProgess,
			code_verifier: verifier,
		};
		const result = await this.gateway.addOauth(acc);
		acc.id = result.insertId;
		return this.createBCRForm(acc);
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

	createBTForm(acc: IBankAccount): string {
		const codeChallange = this.base64URLEncode(this.sha256(acc.code_verifier));
		const ref = this.httpService.axiosRef;
		const config: AxiosRequestConfig = {
			url: this.BT_FORM_URL,
			params: {
				response_type: 'code',
				client_id: this.BT_CLIENT_ID,
				redirect_uri: `${this.UI_HOST}/addBTAccount`,
				scope: `AIS:${this.BT_CONSENT_ID}`,
				state: acc.id,
				code_challenge: codeChallange,
				code_challenge_method: 'S256',
			},
		};
		const url = ref.getUri(config);
		return url;
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

	async getAccountById(id: number): Promise<IBankAccount> {
		const [result] = await this.gateway.getAccountById(id);
		if (!result) {
			throw new NotFoundException('Account not found!');
		}
		return result;
	}

	async getOauthById(id: number): Promise<IOauth> {
		const [result] = await this.gateway.getOauthById(id);
		if (!result) {
			throw new NotFoundException('Oauth not found!');
		}
		return result;
	}

	async handleBTCallbackData(data: IBTOauthResponse, userId: number): Promise<void> {
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
				bank: EnumBanks.BT,
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
				bank: EnumBanks.BT,
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
				bank: EnumBanks.BT,
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
				await this.syncBTAccount(newId);
			}));
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

	async handleBTCallback(request: IBTCallback): Promise<void> {
		const id = +request.state;
		const oauth = await this.getOauthById(id);
		const body = {
			code: request.code,
			grant_type: 'authorization_code',
			redirect_uri: `${this.UI_HOST}/addBTAccount`,
			client_id: this.BT_CLIENT_ID,
			client_secret: this.BT_CLIENT_SECRET,
			code_verifier: oauth.code_verifier,
		};
		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.post(this.BT_TOKEN_URL, stringify(body), {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});
			const data = result.data;
			await this.handleBTCallbackData(data, oauth.user_id);
		} catch (err) {
			console.log(err);
		}
	}

	async updateBankAccountById(bankAccount: IBankAccount, id: number): Promise<void> {
		await this.gateway.updateBankAccountById(bankAccount, id);
	}

	async refreshBTOauthToken(accountId: number): Promise<string> {
		const account = await this.getAccountById(accountId);
		const body = {
			refresh_token: account.refresh_token,
			grant_type: 'refresh_token',
			redirect_uri: `${this.UI_HOST}/addBTAccount`,
			client_id: this.BT_CLIENT_ID,
			client_secret: this.BT_CLIENT_SECRET,
		};

		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.post(this.BT_TOKEN_URL, stringify(body), {
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

	async getTransactionsByAccount(accountId: number): Promise<void> {
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
			const result = await ref.get(`${this.BT_ACCOUNTS_URL}/${account.account_id}/transactions`, {
				params,
				headers: {
					authorization: `Bearer ${account.access_token}`,
					'x-request-id': v4(),
					'consent-id': this.BT_CONSENT_ID,
					'psu-ip-address': '86.126.212.101',
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

	async syncBTAccount(accountId: number): Promise<void> {
		const account = await this.getAccountById(accountId);
		if (moment(account.token_expires_at).isBefore(new Date())) {
			const token = await this.refreshBTOauthToken(account.id);
			account.access_token = token;
		}

		const ref = this.httpService.axiosRef;

		try {

			const result = await ref.get(this.BT_ACCOUNTS_URL, {
				params: {
					withBalance: !!account.balance_see,
				},
				headers: {
					authorization: `Bearer ${account.access_token}`,
					'x-request-id': v4(),
					'consent-id': this.BT_CONSENT_ID,
					'psu-ip-address': '86.126.212.101',
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
			await this.getTransactionsByAccount(accountId);
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
			const token = await this.refreshBTOauthToken(account.id);
			account.access_token = token;
		}

		const ref = this.httpService.axiosRef;

		try {

			const result = await ref.get(this.BT_ACCOUNTS_URL, {
				params: {
					withBalance: !!account.balance_see,
				},
				headers: {
					authorization: `Bearer ${account.access_token}`,
					'x-request-id': v4(),
					'consent-id': this.BT_CONSENT_ID,
					'psu-ip-address': '86.126.212.101',
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
			await this.getTransactionsByAccount(accountId);
		} catch (err) {
			if (err.response) {
				console.log(err.response.data);
			} else {
				console.log(err);
			}
		}
	}

	async getAllByUser(userId: number): Promise<IBankAccount[]> {
		const results = await this.gateway.getAccountsByUser(userId);

		return results;
	}
}

