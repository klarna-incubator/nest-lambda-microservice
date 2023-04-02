import EventEmitter from 'events'

import { ReplaySubject } from 'rxjs'

import { NoConsumerError } from '../errors'
import { OutgoingRequest, OutgoingResponse } from '../interfaces'

export const RequestEvent = Symbol('Request')
export const ResponseEvent = Symbol('Response')
export type SupportedEvent = typeof RequestEvent | typeof ResponseEvent

// TODO Look into replacing the bare node EventEmitter with @nestjs/event-emitter
export class LambdaMicroserviceBroker extends EventEmitter {
  protected isListening = false

  /**
   * Controlled by the Lambda Microservice Server
   * @param callbackFn
   */
  public listen(callbackFn?: (...args: unknown[]) => void) {
    this.isListening = true

    callbackFn && callbackFn()
  }

  /**
   * Controlled by the Lambda Microservice Server
   * @param callbackFn
   */
  public close(callbackFn?: (...args: unknown[]) => void) {
    super.removeAllListeners(ResponseEvent)
    super.removeAllListeners(RequestEvent)

    this.isListening = false

    callbackFn && callbackFn()
  }

  public sendRequest(outgoingRequest: OutgoingRequest): ReplaySubject<OutgoingResponse> {
    const responseStream$ = new ReplaySubject<OutgoingResponse>()

    const responseEventListener = (outgoingResponse: OutgoingResponse) => {
      if (outgoingResponse.id === outgoingRequest.id) {
        responseStream$.next(outgoingResponse)

        if (outgoingResponse.isDisposed) {
          responseStream$.complete()

          super.off(ResponseEvent, responseEventListener)
        }
      }
    }

    if (this.isListening) {
      super.on(ResponseEvent, responseEventListener)

      super.emit(RequestEvent, outgoingRequest)
    } else {
      responseStream$.error(new NoConsumerError())
    }

    return responseStream$
  }
}

export const broker = new LambdaMicroserviceBroker()
