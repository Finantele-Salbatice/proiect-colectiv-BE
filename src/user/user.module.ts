import { Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';
//import { BcryptStrategy } from './bcrypt.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { MailerModule } from 'src/mailer/mailer.module';
//de importat modulul de mailer

@Module({
	providers: [UserGateway, UserService],
	exports: [UserService],
	imports: [SystemModule, AuthModule, MailerModule],
})
export class UserModule {}
