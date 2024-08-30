import { jest } from '@jest/globals'
import { mocked, MockedObject } from 'jest-mock'
import { ReplaySubject } from 'rxjs'

import { LambdaMicroserviceBroker } from '../lambda-microservice.broker'

export const sendRequest = jest.fn<any>()
export const on = jest.fn<any>()
export const emit = jest.fn<any>()
export const once = jest.fn<any>()
export const off = jest.fn<any>()
export const listen = jest.fn<any>().mockImplementation((cb: (...args: unknown[]) => unknown) => cb && cb())
export const close = jest.fn<any>().mockImplementation((cb: (...args: unknown[]) => unknown) => cb && cb())

export const mockServerResponse = (requestId: string, response: unknown) => {
  sendRequest.mockImplementationOnce(() => {
    const subject = new ReplaySubject()

    subject.next({
      id: requestId,
      response: response instanceof Error ? undefined : response,
      err: response instanceof Error ? response : undefined,
      isDisposed: true,
    })
    subject.complete()

    return subject
  })
}

export const LambdaMicroserviceBrokerFactory = () =>
  mocked<Partial<LambdaMicroserviceBroker>>({
    listen,
    close,
    sendRequest,
    on,
    off,
    once,
    emit,
  }) as MockedObject<LambdaMicroserviceBroker>
