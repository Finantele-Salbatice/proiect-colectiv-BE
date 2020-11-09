
import { Database } from '../system/database';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { User } from './models/User';
import { Token } from './models/Token';

//doar functiile care comunica cu baza de date

@Injectable()
export class UserGateway extends Database {
  table: string;
  token: string;
  constructor(configProvider: ConfigProvider) {
    super(configProvider);
    this.table = 'users';
    this.token = 'tokens';
  }
  addUserInDB(user: User): Promise<any> {
    const sql = `
    INSERT INTO ${this.table} set ?;
    `;

    return this.query({
      sql,
      values: [user]
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

  findTokenByToken(t: string): Promise<any> {
    const sql = `
    SELECT * from ${this.token}
    WHERE token = ?;
    `;

    return this.query({
      sql,
      values: [t]
    });
  }


  addTokenInDB(t: Token): Promise<any> {
    const sql = `
    INSERT INTO ${this.token} set ?;
    `;

    return this.query({
      sql,
      values: [t]
    });
  }

  updateToken(t: string): Promise<any> {
    const sql = `
    UPDATE ${this.token} set active = 0 WHERE token = ?;
    `;

    return this.query({
      sql,
      values: [t]
    });
  }
  
  updateUserActivation(id: string): Promise<any> {
    const sql = `
    UPDATE ${this.table} set active = 1 WHERE id = ?;
    `;

    return this.query({
      sql,
      values: [id]
    });
  }
    
}