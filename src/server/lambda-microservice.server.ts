import 'reflect-metadata'

import { Logger } from '@nestjs/common'
import { CustomTransportStrategy, MessageHandler, MsPattern, Server, WritePacket } from '@nestjs/microservices'
import { IdentityDeserializer } from '@nestjs/microservices/deserializers'
import { InvalidMessageException } from '@nestjs/microservices/errors/invalid-message.exception'
import { IdentitySerializer } from '@nestjs/microservices/serializers'

import { LambdaContext } from '../ctx-host'
import { IncomingRequest } from '../interfaces'
import { LambdaMicroserviceBroker, RequestEvent, ResponseEvent } from './lambda-microservice.broker'

export interface LambdaMicroserviceServerOptions {
  broker: LambdaMicroserviceBroker
}

export const CatchAllPattern = '*'

export const PartialMatchExtraProp = 'partialMatch'

export class LambdaMicroserviceServer extends Server implements CustomTransportStrategy {
  protected readonly broker: LambdaMicroserviceBroker

  protected readonly handlerPatternsMap = new Map()

  protected readonly logger = new Logger(LambdaMicroserviceServer.name)

  constructor(private readonly options: LambdaMicroserviceServerOptions) {
    super()

    this.broker = this.options.broker

    this.serializer = new IdentitySerializer()
    this.deserializer = new IdentityDeserializer()
  }

  public async listen(callback: (error?: unknown) => void) {
    try {
      this.broker.listen(() => {
        this.broker.on(RequestEvent, this.handleMessage)

        callback()
      })
    } catch (error: unknown) {
      callback(error)
    }
  }

  public close() {
    this.broker.off(RequestEvent, this.handleMessage)

    this.broker.close()
  }

  public addHandler(pattern: any, callback: MessageHandler, isEventHandler = false, extras: Record<string, any> = {}) {
    const normalizedPattern = this.normalizePattern(pattern)

    // Guard against multiple handlers using same pattern
    if (this.handlerPatternsMap.has(normalizedPattern)) {
      throw new InvalidMessageException()
    }

    this.handlerPatternsMap.set(normalizedPattern, pattern)

    return super.addHandler(pattern, callback, isEventHandler, extras)
  }

  protected handleMessage = async (payload: IncomingRequest) => {
    const { id, context } = payload
    const packet = await this.deserializer.deserialize(payload)
    const lambdaContext = new LambdaContext([context])

    const publish = (data: WritePacket) => {
      this.broker.emit(ResponseEvent, this.serializer.serialize({ ...data, id }))
    }

    const handler = this.getHandlerByPattern(packet.pattern)

    if (handler?.isEventHandler) {
      this.logger.error(
        'Event handlers are not supported by the lambda microservice. Switch to using message handlers to fix this error.',
        this.trySerializeIncomingRequest(payload),
      )
      return publish({
        err: new Error('An illegal event handler qualified for processing the current message'),
      })
    }

    if (!handler) {
      this.logger.error('No handler qualified to process the message', this.trySerializeIncomingRequest(payload))

      return publish({
        err: new Error('No handler qualified to process the message'),
      })
    }

    const response$ = this.transformToObservable(await handler(packet.data, lambdaContext))

    return this.send(response$, publish)
  }

  protected trySerializeIncomingRequest(incomingRequest: IncomingRequest): string {
    try {
      return JSON.stringify(incomingRequest)
    } catch (_error: unknown) {
      return incomingRequest as unknown as string
    }
  }

  public getHandlerByPattern(messagePattern: MsPattern): MessageHandler | null {
    const route = this.getRouteFromPattern(messagePattern as any) // The getRouteFromPattern typings is wrongly accepting just strings

    try {
      // Exact match of the normalized pattern
      if (this.messageHandlers.has(route)) {
        return this.messageHandlers.get(route) ?? null
      }

      // Denormalized match (e.g. if the original pattern is an object)
      for (const [handlerPattern, handler] of this.messageHandlers.entries()) {
        const originalHandlerPattern = this.handlerPatternsMap.get(handlerPattern) ?? route
        const isPartialMatch = Reflect.get(handler.extras ?? {}, PartialMatchExtraProp) ?? false

        if (this.performPatternMatch(originalHandlerPattern, messagePattern, isPartialMatch)) {
          return handler
        }
      }

      // Catch all pattern
      if (this.messageHandlers.has(CatchAllPattern)) {
        return this.messageHandlers.get(CatchAllPattern) ?? null
      }
    } catch (_error: unknown) {
      return null
    }

    return null
  }

  public performPatternMatch(
    handlerPatternPart: unknown,
    messagePatternPart: unknown,
    isPartialObjectMatchAllowed = false,
  ): boolean {
    const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && Boolean(value)
    const isPrimitive = (value: unknown): value is string | number | boolean =>
      ['string', 'number', 'boolean'].includes(typeof value)

    // TODO If the handler provided @MessagePattern is a serialized MsObjectPattern, and its elements order does not match the incoming message pattern, it won't get qualified
    // Potential solution detect, denormalize and match
    if (isPrimitive(messagePatternPart)) {
      return isPrimitive(handlerPatternPart) ? handlerPatternPart === messagePatternPart : false
    }

    if (Array.isArray(messagePatternPart) && Array.isArray(handlerPatternPart)) {
      const sortedMessagePattern = [...messagePatternPart].sort()
      const sortedHandlerPattern = [...handlerPatternPart].sort()

      if (isPartialObjectMatchAllowed) {
        return sortedHandlerPattern.every((messageVal) => {
          if (isPrimitive(messageVal)) {
            return sortedMessagePattern.includes(messageVal)
          }

          return sortedHandlerPattern.some((handlerVal) =>
            this.performPatternMatch(handlerVal, messageVal, isPartialObjectMatchAllowed),
          )
        })
      }

      return sortedMessagePattern.every((val, index) => {
        return this.performPatternMatch(sortedHandlerPattern[index], val, isPartialObjectMatchAllowed)
      })
    }

    if (isObject(messagePatternPart) && isObject(handlerPatternPart)) {
      const keys = isPartialObjectMatchAllowed ? Object.keys(handlerPatternPart) : Object.keys(messagePatternPart)

      return keys.every((key) => {
        return this.performPatternMatch(handlerPatternPart[key], messagePatternPart[key], isPartialObjectMatchAllowed)
      })
    }

    return false
  }
}
