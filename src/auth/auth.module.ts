import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SystemModule } from 'src/system/system.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
	providers: [JwtStrategy],
	exports: [JwtStrategy],
	imports: [PassportModule, SystemModule],
})
export class AuthModule {}