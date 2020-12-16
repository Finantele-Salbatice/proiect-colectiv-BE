import { Injectable } from '@nestjs/common';
import { BrdService } from './brd.service';
import { BtService } from './bt.service';
import { EnumBanks } from './models/Oauth';

@Injectable()
export class AccountCoordinator {
	constructor(private brdService: BrdService, private btService: BtService) {
	}

	addAcount(userId: number, bank: EnumBanks): Promise<string> {
		if (bank === EnumBanks.BT) {
			return this.btService.createBTOauth(userId);
		}
		if (bank === EnumBanks.BRD) {
			return this.brdService.createBRDOauth(userId);
		}
	}
}