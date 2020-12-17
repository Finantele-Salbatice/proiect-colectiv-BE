import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ActivateAccountRequest } from 'src/requests/ActivateAccountRequest';
import { AuthRequest } from 'src/requests/AuthRequest';
import { LoginRequest } from 'src/requests/LoginRequest';
import { RegisterRequest } from 'src/requests/RegisterRequest';
import { ResetRequest } from 'src/requests/ResetRequest';
import { UpdatePasswordRequest } from 'src/requests/UpdatePasswordRequest';
import { User } from './models/User';
import { UserService } from './user.service';

@Controller()
export class UserController {
	constructor(private readonly service: UserService) {}

	@Post('login')
	async login(@Body() body: LoginRequest): Promise<string> {
		console.log('login------------------------------------');
		return this.service.login(body.email, body.password);
	}

	@UseGuards(JwtAuthGuard)
	@Post('info')
	async info(@Request() req: AuthRequest): Promise<User> {
		const { userId } = req.user;
		const user = await this.service.findUserById(userId);
		return {
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			id: user.id,
			created_at: user.created_at,
		};
	}

	@Post('reset')
	async reset(@Body() body: ResetRequest): Promise<any> {
		return this.service.resetPasswd(body.email);
	}

	@Post('updatePassword')
	updatePassword(@Body() body: UpdatePasswordRequest): Promise<any> {
		return this.service.updatePassword(body.token,body.password);
	}

	@Post('register')
	register(@Body() body: RegisterRequest): Promise<any> {
		return this.service.registerUser(body.first_name,body.last_name,body.email,body.password);
	}

	@Post('activate')
	activate(@Body() body: ActivateAccountRequest): Promise<any> {
		return this.service.activateUser(body.token);
	}
}