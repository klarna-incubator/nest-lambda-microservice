import { jest, describe, afterEach, it, expect } from '@jest/globals'
import { Controller, Module } from '@nestjs/common'
import { ClientsModule, MessagePattern, Payload, RpcException } from '@nestjs/microservices'
import { S3EventRecord } from 'aws-lambda/trigger/s3'

import { ClientToken, LambdaMicroserviceBrokerFactory, LambdaMicroserviceClient, S3RecordPattern } from '../../src'
import { makeLambdaHandler } from '../handler'
import { lambdaContextFactory } from '../context'

import { makeS3Event } from './events'

describe('S3 > Lambda', () => {
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('with a catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('*')
      public handlerMethod(@Payload() s3EventRecord: S3EventRecord) {
        return 'Processing done'
      }
    }

    @Module({
      controllers: [TestController],
      imports: [
        ClientsModule.register([{ name: ClientToken, customClass: LambdaMicroserviceClient, options: { broker } }]),
      ],
    })
    class TestAppModule {}

    it('should process any events', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeS3Event()

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual(['Processing done'])
    })
  })

  describe('with no catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('unmatched-pattern')
      public handlerMethod(@Payload() s3EventRecord: S3EventRecord) {
        return 'Processing done'
      }
    }

    @Module({
      controllers: [TestController],
      imports: [
        ClientsModule.register([{ name: ClientToken, customClass: LambdaMicroserviceClient, options: { broker } }]),
      ],
    })
    class TestAppModule {}

    it('should throw as no handler qualifies', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeS3Event()

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })

  describe('with full match message attributes', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern<S3RecordPattern>({
        eventName: 'ObjectCreated:Put',
        bucketName: 'example-bucket',
        objectKey: 'example-object',
      })
      public handlerMethod(@Payload() s3EventRecord: S3EventRecord) {
        return 'Processing done'
      }
    }

    @Module({
      controllers: [TestController],
      imports: [
        ClientsModule.register([{ name: ClientToken, customClass: LambdaMicroserviceClient, options: { broker } }]),
      ],
    })
    class TestAppModule {}

    it('should qualify the handler that fully matches the message attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeS3Event('ObjectCreated:Put', 'example-bucket', 'example-object')

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual(['Processing done'])
    })

    it('should throw when message and pattern values do not match', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeS3Event('ObjectCreated:Put', 'example-bucket', 'another-object')

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })

  describe('with partial match message attributes', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern<Partial<S3RecordPattern>>(
        {
          eventName: 'ObjectCreated:Put',
          bucketName: 'example-bucket',
        },
        { partialMatch: true },
      )
      public handlerMethod(@Payload() s3EventRecord: S3EventRecord) {
        return 'Processing done'
      }
    }

    @Module({
      controllers: [TestController],
      imports: [
        ClientsModule.register([{ name: ClientToken, customClass: LambdaMicroserviceClient, options: { broker } }]),
      ],
    })
    class TestAppModule {}

    it('should qualify the handler that partially matches the message attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const { Records: Records1 } = makeS3Event('ObjectCreated:Put', 'example-bucket', 'some-object')
      const { Records: Records2 } = makeS3Event('ObjectCreated:Put', 'example-bucket', 'another-object')

      const response = await handler({ Records: [...Records1, ...Records2] }, lambdaContextFactory())

      expect(response).toEqual(['Processing done', 'Processing done'])
    })

    it('should throw when message and pattern values do not match', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeS3Event('ObjectCreated:Put', 'another-bucket', 'some-object')

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })

  describe('with a handler that throws a RpcException error', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    class MyRpcException extends RpcException {
      constructor() {
        super('Failed to process the request')
      }
    }

    @Controller()
    class TestController {
      @MessagePattern('*')
      public handlerMethod() {
        throw new MyRpcException()
      }
    }

    @Module({
      controllers: [TestController],
      imports: [
        ClientsModule.register([{ name: ClientToken, customClass: LambdaMicroserviceClient, options: { broker } }]),
      ],
    })
    class TestAppModule {}

    it('should cause an invocation error', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeS3Event()

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual({
        message: 'Failed to process the request',
        status: 'error',
      })
    })
  })
})
