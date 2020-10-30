import { Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
  providers: [UserGateway, UserService],
  exports: [UserService],
  imports: [SystemModule]
})
export class UserModule {}
