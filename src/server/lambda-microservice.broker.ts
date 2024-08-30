import EventEmitter from 'events'
import { ReplaySubject } from 'rxjs'

import { NoConsumerError } from '../errors'
import { OutgoingRequest, OutgoingResponse } from '../interfaces'

export const RequestEvent = Symbol('Request')
export const ResponseEvent = Symbol('Response')
export type SupportedEvent = typeof RequestEvent | typeof ResponseEvent

export class LambdaMicroserviceBroker extends EventEmitter {
  public listen(callbackFn?: (...args: unknown[]) => void) {
    if (callbackFn) {
      callbackFn()
    }
  }

  public close(callbackFn?: (...args: unknown[]) => void) {
    this.removeAllListeners(ResponseEvent)
    this.removeAllListeners(RequestEvent)

    if (callbackFn) {
      callbackFn()
    }
  }

  public sendRequest(outgoingRequest: OutgoingRequest): ReplaySubject<OutgoingResponse> {
    const responseStream$ = new ReplaySubject<OutgoingResponse>()

    const responseEventListener = (outgoingResponse: OutgoingResponse) => {
      if (outgoingResponse.id === outgoingRequest.id) {
        responseStream$.next(outgoingResponse)

        if (outgoingResponse.isDisposed) {
          responseStream$.complete()

          this.off(ResponseEvent, responseEventListener)
        }
      }
    }

    if (this.listeners(RequestEvent).length) {
      this.on(ResponseEvent, responseEventListener)

      this.emit(RequestEvent, outgoingRequest)
    } else {
      responseStream$.error(new NoConsumerError())
    }

    return responseStream$
  }
}

export const LambdaMicroserviceBrokerFactory = () => new LambdaMicroserviceBroker()
