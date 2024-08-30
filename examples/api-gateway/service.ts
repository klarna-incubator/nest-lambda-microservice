import { ClientToken, LambdaMicroserviceServer } from '@klarna/nest-lambda-microservice'
import { INestMicroservice } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions } from '@nestjs/microservices'

import { AppModule } from './app/app.module'
import { broker } from './broker'

let microservice: INestMicroservice
export const getOrCreateLambdaMicroservice = async () => {
  if (!microservice) {
    microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      strategy: new LambdaMicroserviceServer({ broker }),
      logger: false,
      abortOnError: false,
    })

    await microservice.listen()
  }

  return microservice
}

export const getLambdaMicroserviceClient = async () => {
  return await (await getOrCreateLambdaMicroservice()).resolve(ClientToken)
}
