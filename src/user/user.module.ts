import { Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';
//import { BcryptStrategy } from './bcrypt.strategy';
import { AuthModule } from 'src/auth/auth.module';
//de importat modulul de mailer

@Module({
  providers: [UserGateway, UserService],
  exports: [UserService],
  imports: [SystemModule, AuthModule]
})
export class UserModule {}
