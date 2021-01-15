import { ApiProperty } from '@nestjs/swagger';

export class ResetRequest {
    @ApiProperty()
    email: string;
}