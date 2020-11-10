
import { Database } from '../system/database';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { User } from './models/User';
import { Token } from './models/Token';

//doar functiile care comunica cu baza de date

@Injectable()
export class UserGateway extends Database {
  userTable: string;
  tokenTable: string;
  constructor(configProvider: ConfigProvider) {
    super(configProvider);
    this.userTable = 'users';
    this.tokenTable = 'tokens';
  }
  addUserInDB(user: User): Promise<any> {
    const sql = `
    INSERT INTO ${this.userTable} set ?;
    `;

    return this.query({
      sql,
      values: [user]
    });
  }
  findByUsername(username: string): Promise<any> {
    const sql = `
    SELECT * from ${this.userTable}
    WHERE email = ?;
    `;

    return this.query({
      sql,
      values: [username]
    });
  }
  findByUsernameAndPassword(username: string, password: string): Promise<any> {
    const sql = `
    SELECT * from ${this.userTable}
    WHERE email = ? and password = ?;
    `;

    return this.query({
      sql,
      values: [username, password]
    });
  }

  findTokenByToken(token: string): Promise<any> {
    const sql = `
    SELECT * from ${this.tokenTable}
    WHERE token = ?;
    `;

    return this.query({
      sql,
      values: [token]
    });
  }


  addTokenInDB(token: Token): Promise<any> {
    const sql = `
    INSERT INTO ${this.tokenTable} set ?;
    `;

    return this.query({
      sql,
      values: [token]
    });
  }

  updateToken(token: string): Promise<any> {
    const sql = `
    UPDATE ${this.tokenTable} set active = 0 WHERE token = ?;
    `;

    return this.query({
      sql,
      values: [token]
    });
  }
  
  updateUserActivation(id: string): Promise<any> {
    const sql = `
    UPDATE ${this.userTable} set active = 1 WHERE id = ?;
    `;

    return this.query({
      sql,
      values: [id]
    });
  }
    
}