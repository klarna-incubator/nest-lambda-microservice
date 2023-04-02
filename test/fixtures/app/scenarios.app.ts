import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'

import { broker, ClientToken, LambdaMicroserviceClient } from '../../../src'
import { ScenariosController } from './scenarios.controller'
import { ScenariosService } from './scenarios.service'

@Module({
  controllers: [ScenariosController],
  providers: [ScenariosService],
  imports: [
    ClientsModule.register([
      {
        name: ClientToken,
        customClass: LambdaMicroserviceClient,
        options: {
          broker,
        },
      },
    ]),
  ],
})
export class FooBarAppModule {}
