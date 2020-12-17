import { HttpService, Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { TransactionService } from 'src/transactions/transaction.service';
import { AccountGateway } from './account.gateway';
import { AccountService } from './account.service';
import * as moment from 'moment';
import { v4 } from 'uuid';
import { randomBytes } from 'crypto';
import { AxiosRequestConfig } from 'axios';
import { IBTCallback } from 'src/requests/BTCallback';
import { ITransaction } from 'src/transactions/models/Transactions';
import { IBankAccount } from './models/Account';
import { IBTOauthResponse } from './models/BTOauth';
import { IOauth, EnumBanks, EnumBankAccountStatus } from './models/Oauth';
import { stringify } from 'querystring';

@Injectable()
export class BtService extends AccountService {
	constructor(gateway: AccountGateway, configProvider: ConfigProvider, httpService: HttpService, transactionService: TransactionService) {
		super(gateway, configProvider, httpService, transactionService);
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

	get BT_TOKEN_URL(): string {
		return this.configProvider.getConfig().BT_TOKEN_URL;
	}

	get BT_ACCOUNTS_URL(): string {
		return this.configProvider.getConfig().BT_ACCOUNTS_URL;
	}

	async createBTOauth(userId: number): Promise<string> {
		const verifier = this.base64URLEncode(randomBytes(32));
		const oauth: IOauth = {
			user_id: userId,
			bank: EnumBanks.BT,
			status: EnumBankAccountStatus.inProgess,
			code_verifier: verifier,
		};
		const result = await this.gateway.addOauth(oauth);
		oauth.id = result.insertId;
		return this.createBTForm(oauth);
	}

	createBTForm(acc: IOauth): string {
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

	async handleBTCallbackData(data: IBTOauthResponse, oauth: IOauth): Promise<void> {
		const userId = oauth.user_id;
		const accountsCount = +data.accounts_count;
		const transactionsCount = +data.transactions_count;
		const balancesCount = +data.balances_count;
		oauth.refresh_token = data.refresh_tokenl;
		oauth.access_token = data.access_token;
		const accounts: Record<string, IBankAccount> = {
		};
		for (let i = 0; i < accountsCount; i++) {
			const account: IBankAccount = {
				user_id: userId,
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

		await this.updateOauthById(oauth, oauth.id);

		await Promise.all(
			accArray.map(async acc => {
				acc.oauth_id = oauth.id;
				const newId = await this.insertBankAccount(acc);
				await this.syncBTAccount(newId);
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
		const result = await axios.post(this.BT_TOKEN_URL, stringify(body), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		const data = result.data;
		await this.handleBTCallbackData(data, oauth);
	}

	async syncBTAccount(accountId: number): Promise<void> {
		const account = await this.getAccountById(accountId);
		const oauth = await this.getOauthByAccountId(accountId);
		if (moment(oauth.token_expires_at).isBefore(new Date())) {
			const token = await this.refreshBTOauthToken(account.id);
			oauth.access_token = token;
		}

		const ref = this.httpService.axiosRef;

		try {
			const result = await ref.get(this.BT_ACCOUNTS_URL, {
				params: {
					withBalance: !!account.balance_see,
				},
				headers: {
					authorization: `Bearer ${oauth.access_token}`,
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
			await this.getBtTransactionsByAccount(accountId);
		} catch (err) {
			if (err.response) {
				throw new Error(err.response.data);
			}
			throw err;
		}
	}

	async getBtTransactionsByAccount(accountId: number): Promise<void> {
		const account = await this.getAccountById(accountId);
		const ref = this.httpService.axiosRef;
		const oauth = await this.getOauthByAccountId(accountId);
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
					authorization: `Bearer ${oauth.access_token}`,
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
				throw new Error(err.response.data);
			}
			throw err;
		}
	}

	async refreshBTOauthToken(accountId: number): Promise<string> {
		const oauth = await this.getOauthByAccountId(accountId);
		const body = {
			refresh_token: oauth.refresh_token,
			grant_type: 'refresh_token',
			redirect_uri: `${this.UI_HOST}/addBTAccount`,
			client_id: this.BT_CLIENT_ID,
			client_secret: this.BT_CLIENT_SECRET,
		};

		const axios = this.httpService.axiosRef;
		const result = await axios.post(this.BT_TOKEN_URL, stringify(body), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		const data = result.data;
		const token = data.access_token;
		oauth.access_token = token;
		oauth.token_expires_at = moment().add(1, 'hour').toDate();
		await this.updateOauthById(oauth, oauth.id);
		return token;
	}
}