import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { Controller, Module } from '@nestjs/common'
import { ClientsModule, MessagePattern, Payload } from '@nestjs/microservices'

import { ClientToken, LambdaMicroserviceBrokerFactory, LambdaMicroserviceClient } from '../../src'
import { lambdaContextFactory } from '../context'
import { makeLambdaHandler } from '../handler'
import { makeSnsEvent } from './events'

describe('SNS > Lambda', () => {
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('with a catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('*')
      public handlerMethod(@Payload('Message') snsMessage: string) {
        return snsMessage
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
      const event = makeSnsEvent()

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual(['{"name":"John Doe","email":"john.doe@example.com"}'])
    })
  })

  describe('with no catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('unmatched-pattern')
      public handlerMethod(@Payload('Message') snsMessage: string) {
        return snsMessage
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
      const event = makeSnsEvent()

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })

  describe('with full match message attributes', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern({ Foo: 'FooValue', Bar: 100, Baz: ['BazValue1', 'BazValue2'] })
      public handlerMethod(@Payload('Message') snsMessage: string) {
        return snsMessage
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
      const event = makeSnsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue1","BazValue2"]' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual(['{"name":"John Doe","email":"john.doe@example.com"}'])
    })

    it('should qualify the handler that fully matches the message attributes with unsorted string array attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue2","BazValue1"]' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual(['{"name":"John Doe","email":"john.doe@example.com"}'])
    })

    it('should throw when the message has extra attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue1","BazValue2"]' },
        Qux: { Type: 'String', Value: 'QuxValue' },
      })

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })

    it('should throw when the pattern has extra attributes not found on the message', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
      })

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })

    it('should throw when message and pattern values do not match', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsEvent({
        Foo: { Type: 'String', Value: 'DoesNotMatch' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue1","BazValue2"]' },
      })

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })

  describe('with partial match message attributes', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern({ Foo: 'FooValue' }, { partialMatch: true })
      public handlerMethod(@Payload('Message') snsMessage: string) {
        return snsMessage
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
      const event = makeSnsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual(['{"name":"John Doe","email":"john.doe@example.com"}'])
    })

    it('should qualify the handler that partially matches the message attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsEvent({
        Foo: { Type: 'String', Value: 'FooValue' },
        Bar: { Type: 'Number', Value: '100' },
        Baz: { Type: 'String.Array', Value: '["BazValue1","BazValue2"]' },
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual(['{"name":"John Doe","email":"john.doe@example.com"}'])
    })

    it('should throw when message and pattern values do not match', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeSnsEvent({
        Foo: { Type: 'String', Value: 'DoesNotMatch' },
      })

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })
})
