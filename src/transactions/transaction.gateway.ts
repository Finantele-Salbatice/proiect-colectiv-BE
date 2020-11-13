import { Injectable } from '@nestjs/common';
import { Database } from 'src/system/database';

@Injectable()
export class TransactionGateway extends Database {
}