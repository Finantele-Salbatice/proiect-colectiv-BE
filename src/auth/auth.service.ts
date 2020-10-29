import { Injectable } from '@nestjs/common';
import { User } from 'src/user/User';
import { UserService } from '../user/user.service';
import { BcryptStrategy } from './bcrypt.strategy';
import { AuthGateway } from './auth.gateway';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private bcryptStrategy: BcryptStrategy, private gateway: AuthGateway) {}

  async registerUser(first_name: string, last_name: string, username: string, password: string): Promise<User>{
    this.bcryptStrategy.validate(username,password);
    this.bcryptStrategy.generateSalt(password);
    //code to save in db here? and delete bcryptStrategy from here?
    //is it ok to have a similar gateway class as user.gateway?
    // same question for controller... auth.controller has references tu User class... 
    return this.bcryptStrategy.saveUser(first_name,last_name,username,password);
  }
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByEmail(username);
    if (user && user.passowrd === pass) {
      const { passowrd, ...result } = user;
      return result;
    }
    return null;
  }
}
