import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LoginRequest } from 'src/requests/LoginRequest';
import { RegisterRequest } from 'src/requests/RegisterRequest';
import { ResetRequest } from 'src/requests/ResetRequest';
import { UpdatePasswordRequest } from 'src/requests/UpdatePasswordRequest';

import { UserService } from './user.service';


@Controller()
export class UserController {
	constructor(private readonly service: UserService) {}


	@Post('/login')
	async login(@Body() body: LoginRequest): Promise<string> {
		return this.service.login(body.email, body.password);
	}

	@UseGuards(JwtAuthGuard)
	@Post('/test')
	test(@Request() req): void {
		console.log(req.user);
	}

	@Post('/reset')
	async reset(@Body() body: ResetRequest): Promise<any> {
		return this.service.resetPasswd(body.email);
	}

	@Post('/updatePassword')
	async updatePassword(@Body() body: UpdatePasswordRequest): Promise<any> {
		return this.service.updatePassword(body.token,body.password);
	}

	@Post('/register')
	async register(@Body() body: RegisterRequest): Promise<any> {
		return this.service.registerUser(body.first_name,body.last_name,body.email,body.password);
	}
}

