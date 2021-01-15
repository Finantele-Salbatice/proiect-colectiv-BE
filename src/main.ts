import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
	config(); // load .env in process.env
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	const options = new DocumentBuilder()
		.setTitle('Finantele salbatice API')
		.setDescription('API description for back-end')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup('api', app, document);
	await app.listen(3000);
}
bootstrap();
