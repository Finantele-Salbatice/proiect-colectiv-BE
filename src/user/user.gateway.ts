
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
  addUserInDB(first_name: string, last_name: string, username: string, salt: string, hash:string ): Promise<any> {
    const sql = `
    INSERT INTO ${this.table}
    VALUES (?, ?, ?, ?, ?);
    `;

    return this.query({
      sql,
      values: [first_name, last_name, username, salt, hash]
    });
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