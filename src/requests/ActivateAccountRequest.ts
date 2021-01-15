import { ApiProperty } from '@nestjs/swagger';

export class ActivateAccountRequest {
  @ApiProperty()
  token: string;
}