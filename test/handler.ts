import { DynamicModule, ForwardReference, INestMicroservice, Type } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions } from '@nestjs/microservices'
import { Context } from 'aws-lambda'

import { ClientToken, LambdaMicroserviceBroker, LambdaMicroserviceServer } from '../src'

type IEntryNestModule = Type<any> | DynamicModule | ForwardReference | Promise<IEntryNestModule>

export const makeLambdaHandler = (moduleCls: IEntryNestModule, broker: LambdaMicroserviceBroker) => {
  /* The microservice is initialised outside the Lambda handler to be reused in the Lambda execution env */
  let microservice: INestMicroservice

  const getClient = async () => {
    if (!microservice) {
      microservice = await NestFactory.createMicroservice<MicroserviceOptions>(moduleCls, {
        strategy: new LambdaMicroserviceServer({ broker }),
        logger: false,
        abortOnError: false,
      })

      await microservice.listen()
    }

    return await microservice.resolve(ClientToken)
  }

  /* The lambda handler */
  return async (event: unknown, context: Context) => {
    const client = await getClient()

    return await client.processEvent(event, context)
  }
}
