import { Injectable, HttpService } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { AccountGateway } from './account.gateway';
import { EnumBankAccountStatus, EnumBanks, IBankAccount } from './models/Account';
import { randomBytes, createHash } from 'crypto';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class AccountService {
	constructor(private gateway: AccountGateway, private configProvider: ConfigProvider, private httpService: HttpService) {
	}

	async addAcount(userId: number, bank: EnumBanks): Promise<string> {
		if (bank === EnumBanks.BT) {
			return this.createBTAccount(userId);
		}
	}

	get BT_FORM_URL(): string {
		return this.configProvider.config.BT_FORM_URL;
	}

	get BT_CLIENT_ID(): string {
		return this.configProvider.config.BT_CLIENT_ID;
	}

	get BT_CONSENT_ID(): string {
		return this.configProvider.config.BT_CONSENT_ID;
	}

	base64URLEncode(str: Buffer): string {
		return str.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=/g, '');
	}

	async createBTAccount(userId: number): Promise<string> {
		const verifier = this.base64URLEncode(randomBytes(32));
		const acc: IBankAccount = {
			user_id: userId,
			bank: EnumBanks.BT,
			status: EnumBankAccountStatus.inProgess,
			code_verifier: verifier,
		};
		const result = await this.gateway.addAccount(acc);
		acc.id = result.insertId;
		return this.createBTForm(acc);
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
				redirect_uri: `${this.configProvider.config.UI_HOST}/addBTAccount`,
				scope: `AIS:${this.BT_CONSENT_ID}`,
				state: acc.id,
				code_challenge: codeChallange,
				code_challenge_method: 'S256',
			},
		};
		const url = ref.getUri(config);
		return url;
	}
}

