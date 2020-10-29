import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./User";
import { UserGateway } from "./user.gateway";


@Injectable()
export class UserService {
  constructor(private gateway: UserGateway) {}

  async findUserByEmail(email: string): Promise<User>  {
    const [result] = await this.gateway.findByUsername(email);
    if (!result) {
      throw new NotFoundException('Invalid username or password');
    }

    return result;
  }

  async findUserByUsernameAndPassword(email: string, password: string): Promise<User>  {
    const [result] = await this.gateway.findByUsernameAndPassword(email, password); 
    if (!result) {
      throw new NotFoundException('Invalid username or password');
    }

    return result;
  }

}