import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./User";
import { UserGateway } from "./user.gateway";
import * as crypto from "crypto";
import { ConfigProvider } from "src/system/ConfigProvider";

@Injectable()
export class UserService {
  constructor(private gateway: UserGateway, private configProvider: ConfigProvider) {}

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

  async findUserByUsernameAndPassword(email: string, password: string): Promise<User>  {
    const hashedPass = this.createHashedPassword(password);
    console.log(hashedPass);
    const [result] = await this.gateway.findByUsernameAndPassword(email, password); 
    if (!result) {
      throw new NotFoundException('Invalid username or password');
    }

    return result;
  }

  async login(email: string, password: string): Promise<User>  {
    const [user] = await this.gateway.findByUsername(email);
    if (!user) {
      throw new NotFoundException('Invalid username');
    }
    const pswd = this.hashPassword(user.salt, password)

    const [result] = await this.gateway.findByUsernameAndPassword(email, pswd); 
    if (!result) {
      throw new NotFoundException('Invalid username or password');
    }

    return this.getUserToken(result);
  }

  async getUserToken(user: User){
    var jwt = require('jsonwebtoken');
    return jwt.sign({ userid : user.id}, this.secret);
  }

}

