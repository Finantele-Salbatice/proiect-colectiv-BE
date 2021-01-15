import { ApiProperty } from '@nestjs/swagger';

export class SyncAccountBody {
  @ApiProperty()
  accountId: number;
}