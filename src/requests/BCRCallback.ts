import { ApiProperty } from '@nestjs/swagger';

export class BCRCallback {
  @ApiProperty()
  state: string;

  @ApiProperty()
  code: string;
}