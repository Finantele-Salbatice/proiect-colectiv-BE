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