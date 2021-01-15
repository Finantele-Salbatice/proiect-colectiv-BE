import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionsListFilters {
  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  order?: string;

  @ApiPropertyOptional()
  from?: Date;

  @ApiPropertyOptional()
  to?: Date;

  @ApiPropertyOptional()
  accountId?: number;

  @ApiPropertyOptional()
  amountAbove?: number;

  @ApiPropertyOptional()
  amountBelow?: number;

  @ApiProperty()
  skip: number;

  @ApiProperty()
  limit: number;
}