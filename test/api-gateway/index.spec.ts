import { jest, describe, afterEach, it, expect } from '@jest/globals'
import { Controller, Module } from '@nestjs/common'
import { ClientsModule, MessagePattern, Payload } from '@nestjs/microservices'

import {
  ClientToken,
  LambdaMicroserviceBrokerFactory,
  LambdaMicroserviceClient,
  AnyAPIGatewayEvent,
  ApiGatewayPattern,
  isApiGatewayEventV1,
} from '../../src'
import { makeLambdaHandler } from '../handler'
import { lambdaContextFactory } from '../context'
import { makeApiGatewayEventV1, makeApiGatewayEventV2 } from './events'

describe('API Gateway > Lambda', () => {
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('with a catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('*')
      public handlerMethod(@Payload() apiGatewayMessage: AnyAPIGatewayEvent) {
        return {
          statusCode: 200,
          body: isApiGatewayEventV1(apiGatewayMessage)
            ? `${apiGatewayMessage.httpMethod} ${apiGatewayMessage.resource}`
            : apiGatewayMessage.routeKey,
        }
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
      const event = makeApiGatewayEventV1()

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ statusCode: 200, body: 'GET /v1/my-resources/{myResourceId}' })
    })
  })

  describe('with no catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('unmatched-pattern')
      public handlerMethod(@Payload() apiGatewayMessage: AnyAPIGatewayEvent) {
        return {
          statusCode: 200,
          body: isApiGatewayEventV1(apiGatewayMessage)
            ? `${apiGatewayMessage.httpMethod} ${apiGatewayMessage.resource}`
            : apiGatewayMessage.routeKey,
        }
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
      const event = makeApiGatewayEventV1()

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })

  describe('with fully matched request', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern<ApiGatewayPattern>({
        httpMethod: 'GET',
        resource: '/v1/my-resources/{myResourceId}',
        queryStringParameters: { city: 'paris', year: '2022' },
        pathParameters: { myResourceId: '8fe4ac38-4ec6-4e63-b173-0fed5d4aa6ff' },
      })
      public handlerMethod(@Payload() apiGatewayMessage: AnyAPIGatewayEvent) {
        return {
          statusCode: 200,
          body: 'handlerMethod',
        }
      }
    }

    @Module({
      controllers: [TestController],
      imports: [
        ClientsModule.register([{ name: ClientToken, customClass: LambdaMicroserviceClient, options: { broker } }]),
      ],
    })
    class TestAppModule {}

    it.each([
      ['v1', makeApiGatewayEventV1(), { statusCode: 200, body: 'handlerMethod' }],
      ['v2', makeApiGatewayEventV2(), { statusCode: 200, body: 'handlerMethod' }],
    ])('should qualify the handler that fully matches the request %s', async (_version, event, expectedResponse) => {
      const handler = makeLambdaHandler(TestAppModule, broker)

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual(expectedResponse)
    })

    it.each([
      ['v1', makeApiGatewayEventV1({ year: '2022', city: 'paris' }), { statusCode: 200, body: 'handlerMethod' }],
      ['v2', makeApiGatewayEventV2({ year: '2022', city: 'paris' }), { statusCode: 200, body: 'handlerMethod' }],
    ])(
      'should qualify the handler that fully matches the message attributes with unsorted request parameters %s',
      async (_version, event, expectedResponse) => {
        const handler = makeLambdaHandler(TestAppModule, broker)

        const response = await handler(event, lambdaContextFactory())

        expect(response).toEqual(expectedResponse)
      },
    )

    it.each([
      ['v1', makeApiGatewayEventV1({ city: 'paris', year: '2022', month: '01' })],
      ['v2', makeApiGatewayEventV2({ city: 'paris', year: '2022', month: '01' })],
    ])('should throw when the message has extra attributes %s', async (_version, event) => {
      const handler = makeLambdaHandler(TestAppModule, broker)

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })

    it.each([
      ['v1', makeApiGatewayEventV1({ city: 'paris' })],
      ['v2', makeApiGatewayEventV2({ city: 'paris' })],
    ])('should throw when the pattern has extra attributes not found on the message %s', async (_version, event) => {
      const handler = makeLambdaHandler(TestAppModule, broker)

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })

    it.each([
      ['v1', makeApiGatewayEventV1({ city: 'berlin', year: '2022' })],
      ['v2', makeApiGatewayEventV2({ city: 'berlin', year: '2022' })],
    ])('should throw when message and pattern values do not match %s', async (_version, event) => {
      const handler = makeLambdaHandler(TestAppModule, broker)

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })

  describe('with partially matched request', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern<Partial<ApiGatewayPattern>>(
        {
          httpMethod: 'GET',
          resource: '/v1/my-resources/{myResourceId}',
        },
        { partialMatch: true },
      )
      public handlerMethod(@Payload() apiGatewayMessage: AnyAPIGatewayEvent) {
        return {
          statusCode: 200,
          body: 'handlerMethod',
        }
      }
    }

    @Module({
      controllers: [TestController],
      imports: [
        ClientsModule.register([{ name: ClientToken, customClass: LambdaMicroserviceClient, options: { broker } }]),
      ],
    })
    class TestAppModule {}

    it.each([
      ['v1', makeApiGatewayEventV1()],
      ['v2', makeApiGatewayEventV2()],
    ])('should qualify the handler that partially matches the message attributes %s', async (_version, event) => {
      const handler = makeLambdaHandler(TestAppModule, broker)

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ statusCode: 200, body: 'handlerMethod' })
    })

    it.each([
      ['v1', { ...makeApiGatewayEventV1(), httpMethod: 'POST' }],
      ['v2', { ...makeApiGatewayEventV2(), routeKey: 'POST /v1/my-resources/{myResourceId}' }],
    ])('should throw when message and pattern values do not match', async (_title, event) => {
      const handler = makeLambdaHandler(TestAppModule, broker)

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })
})
