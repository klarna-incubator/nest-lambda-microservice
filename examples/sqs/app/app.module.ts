import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ClientToken, LambdaMicroserviceClient } from '@klarna/nest-lambda-microservice'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'

import { broker } from '../broker'

import { BooksController } from './controllers'
import { TransformPipe, ValidationPipeFactory } from './pipes'
import { ExceptionFilter } from './filters'
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
