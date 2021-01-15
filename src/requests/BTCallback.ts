import { ApiProperty } from '@nestjs/swagger';

export class BTCallback {
  @ApiProperty()
  state: string;

  @ApiProperty()
  code: string;
}
