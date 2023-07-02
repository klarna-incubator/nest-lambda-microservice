import { INestMicroservice } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions } from '@nestjs/microservices'
import { ClientToken, LambdaMicroserviceServer } from '@klarna/nest-lambda-microservice'

import { broker } from './broker'
import { AppModule } from './app/app.module'

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
