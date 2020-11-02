import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';

const bcrypt = require('bcrypt');
const saltRounds = 12;

@Injectable()
export class BcryptStrategy extends PassportStrategy(Strategy) {
    
  constructor() {
    super();
  }
  async encryptPassord(password:string): Promise<any>{
    const salt=this.generateSalt(password);
    const hash=this.generateHash(password,salt);  // Store hash in your password DB.
    return hash;
  }
  async decryptAndCheckPassword(password:string, hash){
    // hash- e parola salvata in db, password-parola ce se verifica
    //return true if hash is the hash of the password
    return bcrypt.compareSync(password, hash); // true
  } 
  async generateSalt(pass: String){
    const salt = bcrypt.genSaltSync(saltRounds);
    return salt;
  }
  async generateHash(pass: String, salt){
    const hashedPass = bcrypt.hashSync(pass, salt); // genereaza salt si face hash dupa parola 
    return hashedPass;
  }
}