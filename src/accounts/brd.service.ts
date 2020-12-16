import { Injectable, HttpService } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { AccountGateway } from './account.gateway';
import { EnumBankAccountStatus, IBankAccount } from './models/Account';
import { randomBytes } from 'crypto';
import { EnumBanks, IOauth } from './models/Oauth';
import { TransactionService } from 'src/transactions/transaction.service';
import { ITransaction } from 'src/transactions/models/Transactions';
import { IBRDBalance } from './models/BRDModels/BRDBalance';
import { IBRDTransaction } from './models/BRDModels/BRDTransaction';
import { OkPacket } from 'mysql';
import { AccountService } from './account.service';

@Injectable()
export class BrdService extends AccountService {
	constructor(gateway: AccountGateway, configProvider: ConfigProvider, httpService: HttpService, transactionService: TransactionService) {
		super(gateway, configProvider, httpService, transactionService);
	}

	async addAcountBRD(userId: number): Promise<string> {
		return this.createBRDOauth(userId);
	}

	get BRD_CONSENT_URL(): string {
		return this.configProvider.getConfig().BRD_CONSENT_URL;
	}

	get BRD_ACCOUNTS_URL(): string {
		return this.configProvider.getConfig().BRD_ACCOUNTS_URL;
	}

	base64URLEncode(str: Buffer): string {
		return str.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=/g, '');
	}

	async createBRDOauth(userId: number): Promise<any> {
		const axios = this.httpService.axiosRef;
		let data;
		try {
			const result = await axios.post(this.BRD_CONSENT_URL, {
				access: {
					'allPsd2': 'allAccounts',
				},
				recurringIndicator: true,
				validUntil: '2020-12-31',
				frequencyPerDay: 4,
				combinedServiceIndicator: false,
			},
			{
				headers: {
					'X-Request-ID': 'dd315545-cb97-401e-8364-341e378894aa',
					'PSU-ID': '13333330',
					'PSU-IP-Address': '192.168.0.121',
				},//am pus ipul meu temporar
			});
			data = result.data;
		} catch (err) {
			console.log(err);
		}
		const verifier = this.base64URLEncode(randomBytes(32));
		const acc: IOauth = {
			user_id: userId,
			bank: EnumBanks.BRD,
			status: EnumBankAccountStatus.inProgess,
			access_token: data.consentId,
			code_verifier: verifier,
		};
		const result = await this.gateway.addOauth(acc);
		acc.id = result.insertId;
		return this.handleBRDAccounts(acc);
	}

	//--------------de adus tranzactiile in db folosind consent
	async handleBRDAccounts(acc: IOauth): Promise<void> {
		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.get(this.BRD_ACCOUNTS_URL, {
				headers: {
					'X-Request-ID': 'dd315545-cb97-401e-8364-341e378894aa',
					'Consent-ID': acc.access_token,
					'content-type': 'application/json',
				},
			});
			const data = result.data;
			await this.handleBRDData(acc, data.accounts);
		} catch (err) {
			console.log(err);
		}
	}

	async handleBRDData(acc: IOauth, accounts: any): Promise<void> {
		for (const account of accounts) {
			const balance = await this.getBalanceOfAccount(acc, account.resourceId);
			const savedAccount = await this.saveBalance(acc, account, balance);
			const transactions = await this.getTransactionsOfAccount(acc, account.resourceId);
			await this.saveTransactions(savedAccount,transactions);
		}
	}

	async getBalanceOfAccount(acc: IOauth, accountId: number): Promise<IBRDBalance> {
		const urlBalance = this.BRD_ACCOUNTS_URL + '/' + accountId + '/balances';
		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.get(urlBalance, {
				headers: {
					'X-Request-ID': 'dd315545-cb97-401e-8364-341e378894aa',
					'Consent-ID': acc.access_token,
					'content-type': 'application/json',
				},
			});
			const [data] = result.data.balances;
			return data;
		} catch (err) {
			console.log(err);
		}
	}

	async getTransactionsOfAccount(acc: IOauth, accountId: number): Promise<IBRDTransaction[]> {
		const urlBalance = this.BRD_ACCOUNTS_URL + '/' + accountId + '/transactions';
		const axios = this.httpService.axiosRef;
		try {
			const result = await axios.get(urlBalance, {
				params: {
					dateFrom: '2018-02-03',
					bookingStatus: 'booked',
				},
				headers: {
					'X-Request-ID': 'dd315545-cb97-401e-8364-341e378894aa',
					'Consent-ID': acc.access_token,
					'content-type': 'application/json',
				},
			});
			const data = result.data.transactions.booked;
			return data;
		} catch (err) {
			console.log(err);
		}
	}

	async saveBalance(acc: IOauth, account: any, balance: IBRDBalance): Promise<OkPacket> {
		const bankAccount: IBankAccount = {
			user_id: acc.user_id,
			bank: EnumBanks.BRD,
			account_id: account.resourceId,
			iban: account.iban,
			description: 'Cont BRD',
			balance: balance.balanceAmount.amount,
			currency: account.currency,
			transaction_see: account.iban,
			balance_see: account.iban,
			synced_at: new Date(),
			additional_data: JSON.stringify(account),
		};
		//trebuie fuctie de verificare??
		const result = await this.gateway.addAccount(bankAccount);
		return result;
	}

	async saveTransactions(savedAccount: OkPacket, transactions: IBRDTransaction[]): Promise<void> {
		for (const tran of transactions) {
			const transaction: ITransaction = {
				transaction_id: tran.EndToEndId,
				amount: tran.transactionAmount.amount,
				currency: tran.transactionAmount.currency,
				date_time: new Date(tran.bookingDate),
				account_id: savedAccount.insertId,
				beneficiary: tran.creditorName,
				raw_data: JSON.stringify(tran),
				created_at: new Date (tran.valueDate),
			};
			await this.transactionService.insertTransaction(transaction);
		}
	}

	async syncBRDAccount(): Promise<void> {
		//????
	}

}

