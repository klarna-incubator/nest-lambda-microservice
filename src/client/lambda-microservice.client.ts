import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices'
import { PacketId } from '@nestjs/microservices/interfaces/packet.interface'
import { Context } from 'aws-lambda'
import { catchError, map, merge, of, reduce } from 'rxjs'
import { v4 } from 'uuid'

import { IncomingResponseError } from '../errors'
import { EventMapper } from '../lambda'
import { LambdaMicroserviceBroker } from '../server'
import type { IncomingResponse, LambdaMicroserviceOptions, OutgoingRequest, ResponseTuple } from '../interfaces'

export const ClientToken = Symbol('LambdaMicroserviceClient')

export class LambdaMicroserviceClient extends ClientProxy {
  protected broker: LambdaMicroserviceBroker

  protected eventMapper = new EventMapper()

  protected requestMap = new WeakMap<OutgoingRequest['data'], OutgoingRequest>()

  protected isConnected = false

  constructor(options: LambdaMicroserviceOptions['options']) {
    super()

    this.broker = options.broker

    this.initializeSerializer(options)
    this.initializeDeserializer(options)
  }

  public async close(): Promise<void> {
    if (this.isConnected) {
      this.isConnected = false
    }
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      this.isConnected = true
    }
  }

  public async processEvent(event: unknown, context: Context) {
    const request = this.eventMapper.mapEventToRequest(event, context)
    const requests = Array.isArray(request) ? request : [request]

    return new Promise((resolve, reject) => {
      const merged$ = merge(
        ...requests.map((outgoingRequest) => {
          this.requestMap.set(outgoingRequest.data, outgoingRequest)

          return this.send<IncomingResponse>(outgoingRequest.pattern, outgoingRequest.data)

            .pipe(catchError((err) => of(new IncomingResponseError(outgoingRequest.id, err))))

            .pipe(
              map<IncomingResponse | IncomingResponseError, ResponseTuple>((incomingResponse) => [
                outgoingRequest,
                incomingResponse,
              ]),
            )
        }),
      )

      merged$
        .pipe(
          reduce<ResponseTuple, ResponseTuple[]>((acc, responseTuple) => {
            return [...acc, responseTuple]
          }, []),
        )
        .subscribe((responseTuplesList) => {
          try {
            resolve(this.eventMapper.mapToLambdaResponse(event, responseTuplesList))
          } catch (error: unknown) {
            reject(error)
          }
        })
    })
  }

  protected publish(partialPacket: ReadPacket, callbackFn: (packet: WritePacket) => void): () => void {
    const packet = this.assignPacketId(partialPacket)
    const producerUnsubscribeCallback = () => {
      this.routingMap.delete(packet.id)
    }

    this.routingMap.set(packet.id, callbackFn)

    try {
      const context = this.requestMap.get(packet.data)?.context
      const serializedPacket = this.serializer.serialize(packet)
      const responseCallback = this.createResponseCallback()

      const responseStream$ = this.broker.sendRequest({ ...serializedPacket, context })

      const responseSubscription = responseStream$.subscribe({ next: responseCallback })

      return () => {
        responseSubscription.unsubscribe()

        producerUnsubscribeCallback()
      }
    } catch (err: unknown) {
      callbackFn({ err })
    }

    return producerUnsubscribeCallback
  }

  protected assignPacketId(packet: ReadPacket): ReadPacket & PacketId {
    const incomingRequest = this.requestMap.get(packet.data)
    const id = incomingRequest?.id ?? v4()

    return Object.assign(packet, { id })
  }

  protected dispatchEvent<T>(_packet: ReadPacket): Promise<T> {
    throw new Error('The dispatchEvent is not implemented in Lambda Microservice')
  }

  protected createResponseCallback(): (incomingResponse: WritePacket) => Promise<void> {
    return async (incomingResponse: WritePacket) => {
      const { id, err, response, isDisposed } = await this.deserializer.deserialize(incomingResponse)

      const callbackFn = this.routingMap.get(id)

      if (!callbackFn) {
        return
      }

      if (isDisposed || err) {
        return callbackFn({ err, response, isDisposed: true })
      }

      callbackFn({ err, response })
    }
  }
}
