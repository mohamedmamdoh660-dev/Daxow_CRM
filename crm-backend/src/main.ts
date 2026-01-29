import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });


  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('CRM API Documentation')
    .setDescription('Admission CRM Backend API - Full documentation for all endpoints')
    .setVersion('1.0')
    .addTag('Students', 'Student management endpoints')
    .addTag('Leads', 'Lead management endpoints')
    .addTag('Universities', 'University catalog endpoints')
    .addTag('Countries', 'Country data endpoints')
    .addTag('Applications', 'Application pipeline endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  // Force rebuild 2
  await app.listen(port);

  console.log(`\n🚀 Backend server running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs\n`);
}
bootstrap();
