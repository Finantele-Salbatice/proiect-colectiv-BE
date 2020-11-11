import { Injectable } from '@nestjs/common';

import { genSaltSync, hashSync, compareSync } from 'bcrypt';
const saltRounds = 12;

@Injectable()//inainte avea aici un extend care nu il foloseam
export class BcryptStrategy {

	//constructor() {
	//super();
	//}/
	encryptPassord(password: string): string {
		const salt = this.generateSalt();
		const hash = this.generateHash(password,salt);  // Store hash in your password DB.
		return hash;
	}
	decryptAndCheckPassword(password: string, hash: string): boolean {
		// hash- e parola salvata in db, password-parola ce se verifica
		//return true if hash is the hash of the password
		return compareSync(password, hash); // true
	}
	generateSalt(): string {
		const salt = genSaltSync(saltRounds);
		return salt;
	}
	generateHash(pass: string, salt: string): string {
		const hashedPass = hashSync(pass, salt); // genereaza salt si face hash dupa parola
		return hashedPass;
	}
}