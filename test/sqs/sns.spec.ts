import { jest, describe, afterEach, it, expect } from '@jest/globals'
import { Controller, Module } from '@nestjs/common'
import { ClientsModule, MessagePattern, Payload } from '@nestjs/microservices'

import { ClientToken, LambdaMicroserviceBrokerFactory, LambdaMicroserviceClient, SqsResponseBuilder } from '../../src'
import { makeLambdaHandler } from '../handler'
import { lambdaContextFactory } from '../context'
import { makeSnsSqsEvent } from './events'

describe('SNS > SQS > Lambda', () => {
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('with a catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('*')
      public handlerMethod(@Payload('body') snsMessageBody: string) {
        return snsMessageBody
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
      const event = makeSnsSqsEvent()

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ batchItemFailures: [] })
    })
  })

  describe('with no catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('unmatched-pattern')
      public handlerMethod() {
        return
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
      const event = makeSnsSqsEvent()

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({
        batchItemFailures: [{ itemIdentifier: event.Records[0].messageId }].sort(SqsResponseBuilder.responseCompareFn),
      })
    })
  })

  describe('with full match message attributes', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern({ Foo: 'FooValue', Bar: 100, Baz: ['BazValue1', 'BazValue2'] })
      public handlerMethod() {
        return
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
      const event = makeSnsSqsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue1","BazValue2"]' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ batchItemFailures: [] })
    })

    it('should qualify the handler that fully matches the message attributes with unsorted string array attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsSqsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue2","BazValue1"]' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ batchItemFailures: [] })
    })

    it('should throw when the message has extra attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsSqsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue1","BazValue2"]' },
        Qux: { Type: 'String', Value: 'QuxValue' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ batchItemFailures: [{ itemIdentifier: event.Records[0].messageId }] })
    })

    it('should throw when the pattern has extra attributes not found on the message', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsSqsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ batchItemFailures: [{ itemIdentifier: event.Records[0].messageId }] })
    })

    it('should throw when message and pattern values do not match', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsSqsEvent({
        Foo: { Type: 'String', Value: 'DoesNotMatch' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue1","BazValue2"]' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ batchItemFailures: [{ itemIdentifier: event.Records[0].messageId }] })
    })
  })

  describe('with partial match message attributes', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern({ Foo: 'FooValue' }, { partialMatch: true })
      public handlerMethod() {
        return
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
      const event = makeSnsSqsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ batchItemFailures: [] })
    })

    it('should qualify the handler that partially matches the message attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsSqsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue1","BazValue2"]' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ batchItemFailures: [] })
    })

    it('should throw when message and pattern values do not match', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsSqsEvent({
        Foo: { Type: 'String', Value: 'DoesNotMatch' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ batchItemFailures: [{ itemIdentifier: event.Records[0].messageId }] })
    })
  })
})
