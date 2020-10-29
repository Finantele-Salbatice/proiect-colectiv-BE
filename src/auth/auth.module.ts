
import { Module } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { BcryptStrategy } from './bcrypt.strategy';

@Module({
  imports: [UserModule, PassportModule],
  providers: [AuthService, BcryptStrategy],
})
export class AuthModule {}
