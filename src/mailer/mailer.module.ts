import { Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { MailerService } from './mailer.service';


@Module({
	providers: [MailerService],
	exports: [MailerService],
	imports: [SystemModule],
})
export class MailerModule {}
