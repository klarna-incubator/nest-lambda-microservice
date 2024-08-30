import { ClientToken, LambdaMicroserviceClient } from '@klarna/nest-lambda-microservice'
import { Module } from '@nestjs/common'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { ClientsModule } from '@nestjs/microservices'

import { broker } from '../broker'
import { BooksController } from './controllers'
import { ExceptionFilter } from './filters'
import { TransformPipe, ValidationPipeFactory } from './pipes'
import { BooksService } from './providers'

@Module({
  controllers: [BooksController],
  imports: [
    ClientsModule.register([{ name: ClientToken, customClass: LambdaMicroserviceClient, options: { broker } }]),
  ],
  providers: [
    { provide: APP_PIPE, useClass: TransformPipe },
    { provide: APP_PIPE, useFactory: ValidationPipeFactory },
    { provide: APP_FILTER, useClass: ExceptionFilter },
    BooksService,
  ],
})
export class AppModule {}
