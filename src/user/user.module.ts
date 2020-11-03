import { Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';
import { PassportModule } from '@nestjs/passport';
import { BcryptStrategy } from './bcrypt.strategy';

@Module({
  providers: [UserGateway, UserService, BcryptStrategy],
  exports: [UserService],
  imports: [SystemModule, PassportModule]
})
export class UserModule {}
