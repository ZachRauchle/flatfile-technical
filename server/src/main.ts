/* istanbul ignore file */
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: true,
  })

  // Enable CORS for all routes
  app.enableCors()

  await app.listen(3001)
}
bootstrap()
