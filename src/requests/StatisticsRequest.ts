import { ApiProperty } from '@nestjs/swagger';

export class StatisticsRequestFilter {
  @ApiProperty()
  lastDays: number;
}