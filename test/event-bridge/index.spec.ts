import { jest, describe, afterEach, it, expect } from '@jest/globals'
import { Controller, Module } from '@nestjs/common'
import { ClientsModule, MessagePattern, Payload } from '@nestjs/microservices'

import {
  ClientToken,
  LambdaMicroserviceBrokerFactory,
  LambdaMicroserviceClient,
  AnyEventBridgeEvent,
  EventBridgePattern,
} from '../../src'
import { makeLambdaHandler } from '../handler'
import { lambdaContextFactory } from '../context'

import { makeEventBridgeEvent } from './events'

describe('Event Bridge > Lambda', () => {
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('with a catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('*')
      public handlerMethod(@Payload() eventBridgeMessage: AnyEventBridgeEvent) {
        return eventBridgeMessage.detail
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
      const event = makeEventBridgeEvent(undefined, undefined, {
        'instance-id': 'i-abcd1111',
        state: 'terminated',
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ 'instance-id': 'i-abcd1111', state: 'terminated' })
    })
  })

  describe('with no catch all handler', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern('unmatched-pattern')
      public handlerMethod(@Payload() eventBridgeMessage: AnyEventBridgeEvent) {
        return eventBridgeMessage.detail
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
      const event = makeEventBridgeEvent()

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })

  describe('with full match message attributes', () => {
    const broker = LambdaMicroserviceBrokerFactory()

    @Controller()
    class TestController {
      @MessagePattern<EventBridgePattern>({
        source: 'aws.ec2',
        detailType: 'EC2 Instance State-change Notification',
        detail: {
          'instance-id': 'i-abcd1111',
          state: 'terminated',
        },
      })
      public handlerMethod(@Payload() eventBridgeMessage: AnyEventBridgeEvent) {
        return eventBridgeMessage.detail
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
      const event = makeEventBridgeEvent('aws.ec2', 'EC2 Instance State-change Notification', {
        'instance-id': 'i-abcd1111',
        state: 'terminated',
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ 'instance-id': 'i-abcd1111', state: 'terminated' })
    })

    it('should qualify the handler that fully matches the message attributes with unsorted detail attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeEventBridgeEvent('aws.ec2', 'EC2 Instance State-change Notification', {
        state: 'terminated',
        'instance-id': 'i-abcd1111',
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ 'instance-id': 'i-abcd1111', state: 'terminated' })
    })

    it('should throw when the message has extra attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeEventBridgeEvent('aws.ec2', 'EC2 Instance State-change Notification', {
        unknownAttribute: 'unknownValue',
        state: 'terminated',
        'instance-id': 'i-abcd1111',
      })

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })

    it('should throw when the pattern has extra attributes not found on the message', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeEventBridgeEvent('aws.ec2', 'EC2 Instance State-change Notification', {
        state: 'terminated',
      })

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })

    it('should throw when message and pattern values do not match', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeEventBridgeEvent('aws.ec2', 'EC2 Instance State-change Notification', {
        'instance-id': 'another-instance-id',
        state: 'terminated',
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
      @MessagePattern<Partial<EventBridgePattern>>(
        {
          source: 'aws.ec2',
          detail: {
            state: 'terminated',
          },
        },
        { partialMatch: true },
      )
      public handlerMethod(@Payload() eventBridgeMessage: AnyEventBridgeEvent) {
        return eventBridgeMessage.detail
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
      const event = makeEventBridgeEvent('aws.ec2', 'EC2 Instance State-change Notification', {
        state: 'terminated',
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ state: 'terminated' })
    })

    it('should qualify the handler that partially matches the message attributes', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeEventBridgeEvent('aws.ec2', 'EC2 Instance State-change Notification', {
        state: 'terminated',
        'instance-id': 'i-abcd1111',
      })

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({ 'instance-id': 'i-abcd1111', state: 'terminated' })
    })

    it('should throw when message and pattern values do not match', async () => {
      const handler = makeLambdaHandler(TestAppModule, broker)
      const event = makeEventBridgeEvent('aws.ec2', 'EC2 Instance State-change Notification', {
        state: 'paused',
      })

      await expect(handler(event, lambdaContextFactory())).rejects.toEqual(
        new Error('No handler qualified to process the message'),
      )
    })
  })
})
