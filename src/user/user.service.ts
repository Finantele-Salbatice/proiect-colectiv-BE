import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/user/models/User';
import { UserGateway } from './user.gateway';
import * as crypto from 'crypto';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Token, TokenType } from 'src/user/models/Token';
import { MailerService } from 'src/mailer/mailer.service';
import { json } from 'express';



@Injectable()
export class UserService {
  constructor(private gateway: UserGateway, private configProvider: ConfigProvider, private mailer: MailerService) {
  }

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
      throw new NotFoundException('There is already an account with this email');
    }
  }

  async registerUser(firstName: string, lastName: string, email: string, password: string): Promise<any> {
    const pass=this.createHashedPassword(password);
    const user:User={
      first_name: firstName,
      last_name: lastName,
      active:0,
      email,
      password:pass.key,
      salt:pass.salt,
    }
    //validate email
    await this.validateUser(user);
    const result= await this.gateway.addUserInDB(user);
    const t = uuidv4();
    const token:Token = { 
      user_id : result.insertId,
      token : t,
      active : 1,
      type : TokenType.activate,
    }
    
    await this.gateway.addTokenInDB(token);
    await this.mailer.sendActivateAccountEmail(t, user.email);
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
    if(result.active!=1) {
      throw new NotFoundException('You need to activate your account')
    }
    else{
      return this.getUserToken(result);
    }
  }

  getUserToken(user: User): string {
    return sign({ userId : user.id}, this.secret);
  }

  

  async resetPasswd(email: string): Promise<any> {
    const t = uuidv4();
    try{
      const user = await this.findUserByEmail(email);

      const token:Token = { 
        user_id : user.id,
        token : t,
        active : 1,
        type : TokenType.reset,
      }
      await this.gateway.addTokenInDB(token);
      await this.mailer.sendResetEmail(t, user.email);

    }
    catch(err) {console.log(err);}
    
    return {
      ok:true
    }
  }

  async activateUser(token: string): Promise<any> {
    const [result] = await this.gateway.findTokenByToken(token);
    console.log(result);
    if(!result) {
      throw new NotFoundException('Invalid token');
    }
    else{
      if(result.type== 'activate' && result.active == 0) {
        throw new NotFoundException('Token already used')
      }
      else if(result.type == 'activate' && result.active == 1) {
        await this.gateway.updateToken(token);
        await this.gateway.updateUserActivation(result.user_id);
        return {
          ok:true
        }
        
      }
      throw new NotFoundException('Invalid token');
    }
  }



}


