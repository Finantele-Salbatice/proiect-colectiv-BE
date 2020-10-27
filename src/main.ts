import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {config} from 'dotenv';

async function bootstrap() {
  config(); // load .env in process.env
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
