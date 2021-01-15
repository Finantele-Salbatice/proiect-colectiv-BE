import { ApiProperty } from '@nestjs/swagger';

export class AuthRequest {
  user: {
    userId: number
  };
}
export class BRDRequest {
  @ApiProperty()
  body: {
    userId: number
  };
}