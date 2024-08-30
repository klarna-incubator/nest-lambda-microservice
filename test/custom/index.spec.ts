import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { Controller, Module } from '@nestjs/common'
import { ClientsModule, MessagePattern, RpcException } from '@nestjs/microservices'

import { ClientToken, LambdaMicroserviceBrokerFactory, LambdaMicroserviceClient } from '../../src'
import { lambdaContextFactory } from '../context'
import { makeLambdaHandler } from '../handler'

describe('Manual Input > Lambda', () => {
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('with a catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('*')
      public handlerMethod() {
        return 'Results'
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
      const event = { name: 'John Doe', email: 'john.doe@example.com' }

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual('Results')
    })
  })

  describe('with no catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('unmatched-pattern')
      public handlerMethod() {
        return 'Results'
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
      const event = { name: 'John Doe', email: 'john.doe@example.com' }

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })

  describe('with a handler that throws a non RpcException error', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('*')
      public handlerMethod() {
        throw new Error('Failed to process the request')
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
      const event = { name: 'John Doe', email: 'john.doe@example.com' }

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual({
        message: 'Internal server error',
        status: 'error',
      })
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
      const event = { name: 'John Doe', email: 'john.doe@example.com' }

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual({
        message: 'Failed to process the request',
        status: 'error',
      })
    })
  })
})
