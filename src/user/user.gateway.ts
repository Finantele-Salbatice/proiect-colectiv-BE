
import { Database } from '../system/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserGateway extends Database {
  table: string;
  constructor() {
    super();
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