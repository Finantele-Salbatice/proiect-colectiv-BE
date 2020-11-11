import { Module } from '@nestjs/common';
import { SystemModule } from './system/system.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';

@Module({
	imports: [SystemModule, UserModule],
	controllers: [UserController],
})
export class AppModule {}
