import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequest } from 'src/requests/LoginRequest';
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
  async login(@Body() body: LoginRequest): Promise<string> {    
    return this.service.login(body.username, body.password);
  }

}

