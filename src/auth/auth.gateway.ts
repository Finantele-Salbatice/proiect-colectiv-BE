import { Database } from '../system/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGateway extends Database {
  table: string;
  constructor() {
    super();
    this.table = 'users';
  }
  addUserInDb(first_name: string, last_name:string, username:string, hasedPassword:string){
    const sql=`INSERT INTO ${this.table}
    VALUES (${first_name}, ${last_name}, ${username}, ${hasedPassword});`;
    return this.query({
        sql,
        values: [username]
      });
  }  
}