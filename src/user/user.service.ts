import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./User";
import { UserGateway } from "./user.gateway";
import * as crypto from "crypto";
import { ConfigProvider } from "src/system/ConfigProvider";
import { BcryptStrategy } from './bcrypt.strategy';

@Injectable()
export class UserService {
  constructor(private gateway: UserGateway, private configProvider: ConfigProvider, private bcryptStrategy: BcryptStrategy) {}

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
    const salt = crypto.randomBytes(16).toString("hex");
    const key = crypto.scryptSync(password, salt, 32);
    const newPassword = key.toString('hex');
    return {
      key: newPassword,
      salt
    };
  }

  hashPassword(salt: string, password: string): string {
    const key = crypto.scryptSync(password, salt, 32);
    return key.toString('hex');
  }

  async registerUser(first_name: string, last_name: string, username: string, password: string){
    const hash=this.bcryptStrategy.encryptPassord(password);
    this.gateway.addUserInDB(first_name,last_name,username,hash);
    
    
  }

  async findUserByUsernameAndPassword(email: string, password: string): Promise<User>  {
    const hashedPass = this.createHashedPassword(password);
    console.log(hashedPass);
    const [result] = await this.gateway.findByUsernameAndPassword(email, password); 
    if (!result) {
      throw new NotFoundException('Invalid username or password');
    }

    return result;
  }

}