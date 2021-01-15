import { ApiProperty } from '@nestjs/swagger';

export class BRDCallback {
  @ApiProperty()
  state: string;

  @ApiProperty()
  code: string;
}
