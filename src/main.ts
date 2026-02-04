import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule , {bufferLogs: true});
  await app.listen(process.env.PORT ?? 3000);
  console.log(`this service is running on port ${process.env.PORT ?? 3000}`)
}
bootstrap();
