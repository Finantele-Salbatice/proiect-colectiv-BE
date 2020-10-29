import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserGateway } from "../user/user.gateway";
import { UserService } from 'src/user/user.service';

const bcrypt = require('bcrypt');
const saltRounds = 12;

@Injectable()
export class BcryptStrategy extends PassportStrategy(Strategy) {
    
  constructor(private authService: AuthService) {
    super();
  }
  async saveUser(first_name: string, last_name:string, username:string, password:string): Promise<any>{
    const pass=this.generateSalt(password);
    //code to save the user in db? using the auth.gateway? in here

  }
  async generateSalt(pass: String){
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(pass, salt); // genereaza salt si face hash dupa parola 
    return hash;
    // Store hash in your password DB.
  }
  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}