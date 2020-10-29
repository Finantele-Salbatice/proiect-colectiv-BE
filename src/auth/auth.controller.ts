import { Body, Controller, Post } from '@nestjs/common';
import { RegisterRequest } from 'src/requests/RegisterRequest';
import { User } from '../user/User';
import { AuthService } from '../auth/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService:AuthService) {}

  // va returna Userul daca sa facut cu succes inregistrarea, erroare altfel
  @Post('/register')
  async register(@Body() body: RegisterRequest): Promise<User> {
    return this.authService.registerUser(body.first_name,body.last_name,body.username,body.password);
  }

}
