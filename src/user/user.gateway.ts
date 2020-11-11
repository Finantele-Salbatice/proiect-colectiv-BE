
import { Database } from '../system/database';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { User } from './models/User';
import { Token } from './models/Token';

//doarfunctiilecarecomunicacubazadedate

@Injectable()
export class UserGateway extends Database {
table: string;
token: string;
constructor(configProvider: ConfigProvider) {
	super(configProvider);
	this.table = 'users';
	this.token = 'tokens';
}
addUserInDB(user: User): Promise<any> {
	const sql = `
INSERTINTO${this.table}set?;
`;

	return this.query({
		sql,
		values:[user],
	});
}
updateUser(user: User,id: number): Promise<any> {
	const sql = `
UPDATE${this.table}
SET?
WHEREid=?;
`;

	return this.query({
		sql,
		values:[user,id],
	});
}
updateToken(token: Token,id: number): Promise<any> {
	const sql = `
UPDATE${this.token}
SET?
WHEREid=?;
`;

	return this.query({
		sql,
		values:[token,id],
	});
}
findById(id: number): Promise<any> {
	const sql = `
SELECT*from${this.table}
WHEREid=?;
`;

	return this.query({
		sql,
		values:[id],
	});
}
findByUsername(username: string): Promise<any> {
	const sql = `
SELECT*from${this.table}
WHEREemail=?;
`;

	return this.query({
		sql,
		values:[username],
	});
}
findByUsernameAndPassword(username: string,password: string): Promise<any> {
	const sql = `
SELECT*from${this.table}
WHEREemail=?andpassword=?;
`;

	return this.query({
		sql,
		values:[username,password],
	});
}


addTokenInDB(t: Token): Promise<any> {
	const sql = `
INSERTINTO${this.token}set?;
`;

	return this.query({
		sql,
		values:[t],
	});
}

findRestToken(token: string): Promise<any> {
	const sql = `
SELECT*from${this.token}
WHEREtoken=?andactive=?andtype=?;
`;

	return this.query({
		sql,
		values:[token,1,'reset'],
	});
}

}