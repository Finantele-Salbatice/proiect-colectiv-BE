import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequest } from 'src/requests/LoginRequest';
import { RegisterRequest } from 'src/requests/RegisterRequest';
import { User } from './User';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('/find')
  async find(@Body() body: LoginRequest): Promise<User> {
    return this.service.findUserByEmail(body.username);
  }

  @Post('/login')
  async login(@Body() body: LoginRequest): Promise<User> {
    return this.service.findUserByUsernameAndPassword(body.username, body.password);
  }

  @Post('/register')
  async register(@Body() body: RegisterRequest){
    return this.service.registerUser(body.first_name,body.last_name,body.username,body.password);
  }

}
