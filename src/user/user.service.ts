import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./models/User";
import { UserGateway } from "./user.gateway";
import * as crypto from "crypto";
import { ConfigProvider } from "src/system/ConfigProvider";
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Token, TokenType } from "./models/Token";
import { MailerService } from "src/mailer/mailer.service";



@Injectable()
export class UserService {
  constructor(private gateway: UserGateway, private configProvider: ConfigProvider, private mailer: MailerService) {}

  get secret() {
    return this.configProvider.getConfig().SECRET_KEY;
  }


  async findUserByEmail(email: string): Promise<User>  {
    const [result] = await this.gateway.findByUsername(email);
    if (!result) {
      throw new NotFoundException('Invalid username or password');
    }

    return result;
  }

  createHashedPassword(password: string) {
    const salt = crypto.randomBytes(32).toString("hex");
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

  async registerUser(first_name: string, last_name: string, email: string, password: string){
    const pass=this.createHashedPassword(password);
    const user:User={
      first_name,
      last_name,
      active:1,
      email,
      password:pass.key,
      salt:pass.salt,
    }
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

  

  async resetPasswd(email: string) {
    const t = uuidv4();
    try{
      const user = await this.findUserByEmail(email);

      const token:Token = { 
        user_id : user.id,
        token : t,
        active : 1,
        type : TokenType.reset,
      }
      const result= await this.gateway.addTokenInDB(token);
      await this.mailer.sendResetEmail(t, user.email);

    }
    catch(err){console.log(err);}
    
    

    return {
      ok:true
    }
  }

}

