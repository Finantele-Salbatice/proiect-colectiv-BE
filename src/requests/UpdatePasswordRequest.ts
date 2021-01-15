import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePasswordRequest {
  @ApiPropertyOptional()
  token: string;

  @ApiPropertyOptional()
  password: string;
}