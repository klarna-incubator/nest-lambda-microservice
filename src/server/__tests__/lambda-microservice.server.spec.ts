import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { MessageHandler } from '@nestjs/microservices'
import { InvalidMessageException } from '@nestjs/microservices/errors/invalid-message.exception'

import { LambdaMicroserviceServer } from '../lambda-microservice.server'
import { LambdaMicroserviceBrokerFactory } from '../mocks'

jest.mock('../../server/lambda-microservice.broker')

describe('LambdaMicroserviceServer', () => {
  let server: LambdaMicroserviceServer

  beforeEach(async () => {
    server = new LambdaMicroserviceServer({ broker: LambdaMicroserviceBrokerFactory() })

    await server.listen(jest.fn())
  })

  afterEach(async () => {
    await server.close()
  })

  describe('message pattern matching', () => {
    it('should match a MsFundamentalPattern (string)', () => {
      const fooBarBazHandler = jest.fn<MessageHandler>()

      server.addHandler('/foo/bar/baz', fooBarBazHandler, false)

      expect(server.getHandlerByPattern('')).toBeNull()
      expect(server.getHandlerByPattern('foo/bar/baz')).toBeNull()
      expect(server.getHandlerByPattern('/foo/bar/baz')).toEqual(fooBarBazHandler)
    })

    it('should match a MsFundamentalPattern (number)', () => {
      const firstHandler = jest.fn<MessageHandler>()
      const secondHandler = jest.fn<MessageHandler>()

      server.addHandler(1, firstHandler, false)
      server.addHandler(2, secondHandler, false)

      expect(server.getHandlerByPattern('')).toBeNull()
      expect(server.getHandlerByPattern(1)).toEqual(firstHandler)
      expect(server.getHandlerByPattern(2)).toEqual(secondHandler)
      expect(server.getHandlerByPattern(3)).toBeNull()
    })

    it('should match a MsObjectPattern (normalized/serialized)', () => {
      const handlerCb = jest.fn<MessageHandler>()

      server.addHandler('{"Val1":"Value 1","Val2":"Value 2","Val3":{"0":"Foo","1":"Bar"}}', handlerCb, false)

      expect(server.getHandlerByPattern('')).toBeNull()
      expect(server.getHandlerByPattern('{"Val1":"Value 1","Val2":"Value 2"}')).toBeNull()
      expect(server.getHandlerByPattern('{"Val1":"Value 1","Val2":"Value 2"}')).toBeNull()
      expect(server.getHandlerByPattern({ Val1: 'Value 1', Val2: 'Value 2' })).toBeNull()
      expect(server.getHandlerByPattern({ Val1: 'Value 1', Val2: 'Value 2', Val3: ['Foo', 'Bar'] } as any)).toEqual(
        handlerCb,
      )
    })

    it.skip('should match a MsObjectPattern (normalized/serialized) regardless of the sorting', () => {
      const handler = jest.fn<MessageHandler>()

      server.addHandler('{"Val1":"Value 1","Val2":"Value 2"}', handler, false)

      expect(server.getHandlerByPattern('{"Val1":"Value 1","Val2":"Value 2"}')).toEqual(handler)
      expect(server.getHandlerByPattern('{"Val2":"Value 2","Val1":"Value 1"}')).toEqual(handler) // TODO Serialized handler patterns are not sorted ATM during qualification phase
    })

    it('should match a MsObjectPattern', () => {
      const handler = jest.fn<MessageHandler>()

      server.addHandler({ Val1: 'Value 1', Val2: 'Value 2', Val3: ['Foo', 'Bar'] }, handler, false)

      expect(server.getHandlerByPattern('')).toBeNull()
      expect(server.getHandlerByPattern({ Val1: 'Value 1', Val2: 'Value 2', Val3: ['Foo', 'Bar'] })).toEqual(handler)
    })

    it('should match a MsObjectPattern regardless of the sorting', () => {
      const handler = jest.fn<MessageHandler>()

      server.addHandler({ Val1: 'Value 1', Val2: 'Value 2', Val3: ['Foo', 'Bar'] }, handler, false)

      expect(server.getHandlerByPattern({ Val2: 'Value 2', Val1: 'Value 1', Val3: ['Foo', 'Bar'] } as any)).toEqual(
        handler,
      )

      expect(server.getHandlerByPattern({ Val1: 'Value 1', Val2: 'Value 2', Val3: ['Bar', 'Foo'] } as any)).toEqual(
        handler,
      )
    })

    it('should partially match a MsObjectPattern', () => {
      const handler = jest.fn<MessageHandler>()

      server.addHandler({ Val1: 'Value 1', Val2: 'Value 2' }, handler, false, { partialMatch: true })

      expect(server.getHandlerByPattern({ Val1: 'Value 1' })).toBeNull()
      expect(server.getHandlerByPattern({ Val1: 'Value 1', Val3: 'Value 3' })).toBeNull()
      expect(server.getHandlerByPattern({ Val2: 'Value 2', Val1: 'Value 1', Val3: ['Foo', 'Bar'] } as any)).toEqual(
        handler,
      )
    })

    it('should partially match a MsObjectPattern with string list', () => {
      const handler = jest.fn<MessageHandler>()

      server.addHandler({ Val1: ['Foo', 'Bar'] }, handler, false, { partialMatch: true })

      expect(server.getHandlerByPattern({ Val1: 'Foo' })).toBeNull()
      expect(server.getHandlerByPattern({ Val1: ['Bar', 'Foo', 'Baz'] } as any)).toEqual(handler)
    })

    it('should match the exact pattern if available when multiple partial matches occur', () => {
      const exactMatchHandler = jest.fn<MessageHandler>()
      const partialMatchHandler = jest.fn<MessageHandler>()

      server.addHandler({ Val1: 1 }, partialMatchHandler, false, { partialMatch: true })
      server.addHandler({ Val1: 1, Val2: 2 }, exactMatchHandler, false, { partialMatch: true })

      expect(server.getHandlerByPattern({ Val1: 1, Val2: 2 })).toEqual(exactMatchHandler)
    })

    it('should match the first registered pattern when multiple partial matches occur', () => {
      const firstHandler = jest.fn<MessageHandler>()
      const secondHandler = jest.fn<MessageHandler>()

      server.addHandler({ Val1: 1 }, firstHandler, false, { partialMatch: true })
      server.addHandler({ Val1: 1, Val2: 2 }, secondHandler, false, { partialMatch: true })

      expect(server.getHandlerByPattern({ Val1: 1, Val2: 2, Val3: 3 })).toEqual(firstHandler)
    })

    it('should qualify a catch-all handler if defined', () => {
      const fooHandler = jest.fn<MessageHandler>()
      const catchAllHandler = jest.fn<MessageHandler>()

      server.addHandler('/foo', fooHandler, false)
      server.addHandler('*', catchAllHandler, false)

      expect(server.getHandlerByPattern('/foo')).toEqual(fooHandler)
      expect(server.getHandlerByPattern('/bar')).toEqual(catchAllHandler)
    })

    it('should match an incoming object pattern with a normalized object pattern defined in the handler', () => {
      const fooBarHandler = jest.fn<MessageHandler>()

      server.addHandler('{"foo":"bar"}', fooBarHandler, false)

      expect(server.getHandlerByPattern({ foo: 'bar' })).toBe(fooBarHandler)
    })

    it('should disallow multiple handlers having same message pattern', () => {
      const fooHandler = jest.fn<MessageHandler>()
      const barHandler = jest.fn<MessageHandler>()

      server.addHandler({ foo: 'bar' }, fooHandler, false)

      expect(() => server.addHandler({ foo: 'bar' }, barHandler, false)).toThrow(InvalidMessageException)
    })
  })
})
