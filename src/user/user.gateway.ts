
import { Database } from '../system/database';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';

@Injectable()
export class UserGateway extends Database {
  table: string;
  constructor(configProvider: ConfigProvider) {
    super(configProvider);
    this.table = 'users';
  }

  findByUsername(username: string): Promise<any> {
    const sql = `
    SELECT * from ${this.table}
    WHERE email = ?;
    `;

    return this.query({
      sql,
      values: [username]
    });
  }
  findByUsernameAndPassword(username: string, password: string): Promise<any> {
    const sql = `
    SELECT * from ${this.table}
    WHERE email = ? and password = ?;
    `;

    return this.query({
      sql,
      values: [username, password]
    });
  }
    
}