import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔐 Security: Helmet adds essential HTTP security headers
  // X-Frame-Options, X-Content-Type-Options, CSP, etc.
  app.use(helmet());

  // Enable CORS for Frontend communication
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
  app.enableCors({
    origin: allowedOrigins,
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

  // 🔐 Security: Only enable Swagger in development
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`📚 API Documentation: http://localhost:${process.env.PORT || 3001}/api/docs\n`);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`\n🚀 Backend server running on: http://localhost:${port}`);
}
bootstrap();
