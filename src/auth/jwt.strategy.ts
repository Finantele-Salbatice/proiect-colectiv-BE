import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from 'src/system/ConfigProvider';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(configProvider: ConfigProvider) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configProvider.getConfig().SECRET_KEY,
		});
	}

	validate(payload: any): any {
		return {
			userId: payload.userId,
		};
	}
}