import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:8081",
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  })

  app.setGlobalPrefix('api/v1')

  app.use(cookieParser())

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000);
}
bootstrap();
