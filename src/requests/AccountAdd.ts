import { ApiProperty } from '@nestjs/swagger';
import { EnumBanks } from 'src/accounts/models/Oauth';

export class AccountAdd {
	@ApiProperty({
		enum: EnumBanks,
	})
	bank: EnumBanks;
}