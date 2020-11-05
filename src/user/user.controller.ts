import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequest } from 'src/requests/LoginRequest';
import { RegisterRequest } from 'src/requests/RegisterRequest';
import { User } from './User';
import { UserService } from './user.service';


@Controller()
export class UserController {
  constructor(private readonly service: UserService) {}


  @Post('/login')
  async login(@Body() body: LoginRequest): Promise<string> {    
    return this.service.login(body.email, body.password);
  }

  @Post('/register')
  async register(@Body() body: RegisterRequest): Promise<any>{
    return this.service.registerUser(body.first_name,body.last_name,body.email,body.password);
  }

}

