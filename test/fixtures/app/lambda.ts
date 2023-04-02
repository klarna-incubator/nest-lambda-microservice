import { INestMicroservice } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions } from '@nestjs/microservices'
import { Context } from 'aws-lambda'

import { broker, ClientToken, LambdaMicroserviceServer } from '../../../src'
import { FooBarAppModule } from './scenarios.app'

let microservice: INestMicroservice

const getClient = async () => {
  if (!microservice) {
    microservice = await NestFactory.createMicroservice<MicroserviceOptions>(FooBarAppModule, {
      strategy: new LambdaMicroserviceServer({ broker }),
      logger: false,
      abortOnError: false,
    })

    await microservice.listen()
  }

  return await microservice.resolve(ClientToken)
}

export const handler = async (event: any, context: Context) => {
  const client = await getClient()

  return await client.processEvent(event, context)
}
