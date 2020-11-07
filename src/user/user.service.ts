import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './User';
import { UserGateway } from './user.gateway';
import * as crypto from 'crypto';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { sign } from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(private gateway: UserGateway, private configProvider: ConfigProvider) {}

  get secret(): string {
    return this.configProvider.getConfig().SECRET_KEY;
  }

  async findUserByEmail(email: string): Promise<User>  {
    const [result] = await this.gateway.findByUsername(email);
    if (!result) {
      throw new NotFoundException('Invalid username or password');
    }

    return result;
  }

  createHashedPassword(password: string): any {
    const salt = crypto.randomBytes(32).toString('hex');
    const key = crypto.scryptSync(password, salt, 64);
    const newPassword = key.toString('hex');
    return {
      key: newPassword,
      salt
    };
  }

  hashPassword(salt: string, password: string): string {
    const key = crypto.scryptSync(password, salt, 64);
    return key.toString('hex');
  }

  async validateUser(user: User): Promise<void> {
    const [result] = await this.gateway.findByUsername(user.email);
    if (result) {
      throw new Error('There is already an account with this email');
    }
  }

  async registerUser(firstName: string, lastName: string, email: string, password: string): Promise<any> {
    const pass=this.createHashedPassword(password);
    const user:User={
      first_name: firstName,
      last_name: lastName,
      active:1,
      email,
      password:pass.key,
      salt:pass.salt,
    }
    //validate email
    await this.validateUser(user);
    const result= await this.gateway.addUserInDB(user);
    return {
      ok:true
    }
  }

  async findUserByUsernameAndPassword(email: string, password: string): Promise<User>  {
    const [result] = await this.gateway.findByUsernameAndPassword(email, password); 
    if (!result) {
      throw new NotFoundException('Invalid username or password');
    }

    return result;
  }

  async login(email: string, password: string): Promise<string>  {
    const user = await this.findUserByEmail(email);
    const pswd = this.hashPassword(user.salt, password)
    const result = await this.findUserByUsernameAndPassword(email, pswd);
    return this.getUserToken(result);
  }

  getUserToken(user: User): string {
    return sign({ userId : user.id}, this.secret);
  }

}

