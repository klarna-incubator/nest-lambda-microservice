import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Context } from 'aws-lambda'
import { MockedFunction } from 'jest-mock'
import { v4 } from 'uuid'

import { LambdaMicroserviceBroker } from '../../server'
import { LambdaMicroserviceBrokerFactory, mockServerResponse } from '../../server/mocks'
import { LambdaMicroserviceClient } from '../lambda-microservice.client'

jest.mock('uuid')

describe('LambdaMicroserviceClient', () => {
  const requestId = '21edf5bc-8f37-457f-bcdb-207d9156c42f'
  const contextFactory = () => ({}) as Context
  const uuidV4 = v4 as MockedFunction<() => string>
  let broker: LambdaMicroserviceBroker
  let event: any
  let context: Context
  let client: LambdaMicroserviceClient

  beforeEach(() => {
    context = contextFactory()
    broker = LambdaMicroserviceBrokerFactory()

    client = new LambdaMicroserviceClient({ broker })

    uuidV4.mockReturnValueOnce(requestId)
  })

  afterEach(() => {
    client.close()
    broker.close()
    jest.clearAllMocks()
  })

  describe('custom', () => {
    beforeEach(() => {
      event = { foo: 'bar' }
    })

    it('should send the request to the server', async () => {
      mockServerResponse(requestId, null)

      await client.processEvent(event, context)

      expect(broker.sendRequest).toHaveBeenCalledWith({
        context,
        data: event,
        id: requestId,
        pattern: '*',
      })
    })

    it('should pipe back the server response', async () => {
      mockServerResponse(requestId, { bar: 'baz' })

      const response = await client.processEvent(event, context)

      expect(response).toEqual({ bar: 'baz' })
    })

    it('should fail on server error', async () => {
      const serverError = new Error('Failed')
      mockServerResponse(requestId, serverError)

      await expect(() => client.processEvent(event, context)).rejects.toEqual(serverError)
    })
  })

  describe('SQS', () => {
    const sqsMessageIdFactory = (sequence: number) => `sqs-message-${sequence}`
    const sqsEventFactory = (recordsCount: number) => ({
      Records: new Array(recordsCount)
        .fill({
          messageId: '',
          receiptHandle: 'MA==',
          body: JSON.stringify({ foo: 'bar' }),
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '946684800001',
            SenderId: 'AIDAIVEA3AGEU7NF6DRAG',
            ApproximateFirstReceiveTimestamp: '946684800001',
          },
          messageAttributes: {
            BazAttr: { dataType: 'String', stringValue: 'BazAttrVal' },
            FooAttr: { dataType: 'String', stringValue: 'FooAttrVal' },
            BarAttr: { dataType: 'String', stringValue: 'false' },
            QuxAttr: { dataType: 'Number', stringValue: '42' },
          },
          md5OfBody: '9e4be8d49e443577d8d883e203e3b64a',
          eventSource: 'aws:sqs',
          eventSourceARN: 'arn:aws:sqs:eu-west-1:000000000001:FooBarQueue',
          awsRegion: 'eu-west-1',
        })
        .map((record, index) => ({ ...record, messageId: sqsMessageIdFactory(index) })),
    })

    beforeEach(() => {
      event = sqsEventFactory(10)
    })

    it('should send a request per SQS record to the server', async () => {
      const sendRequestSpy = jest.spyOn(broker, 'sendRequest')
      const recordsCount = 10
      event = sqsEventFactory(recordsCount)

      for (let i = 0; i < recordsCount; i++) {
        mockServerResponse(sqsMessageIdFactory(i), { computedValue: i })
      }

      await client.processEvent(event, context)

      expect(sendRequestSpy).toHaveBeenCalledTimes(recordsCount)

      for (let i = 0; i < sendRequestSpy.mock.calls.length; i++) {
        const [callArg0] = sendRequestSpy.mock.calls[i]
        expect(callArg0).toEqual({
          context,
          data: event.Records[i],
          id: sqsMessageIdFactory(i),
          pattern: {
            BazAttr: 'BazAttrVal',
            FooAttr: 'FooAttrVal',
            BarAttr: false,
            QuxAttr: 42,
          },
        })
      }
    })

    it('should pipe back the server response', async () => {
      const recordsCount = 10

      const isLucky = (seq: number) => Boolean(seq % 2)

      event = sqsEventFactory(recordsCount)

      for (let i = 0; i < recordsCount; i++) {
        mockServerResponse(sqsMessageIdFactory(i), isLucky(i) ? { computedValue: i } : new Error('Failed'))
      }

      const response = await client.processEvent(event, context)

      expect(response).toEqual({
        batchItemFailures: [
          { itemIdentifier: 'sqs-message-0' },
          { itemIdentifier: 'sqs-message-2' },
          { itemIdentifier: 'sqs-message-4' },
          { itemIdentifier: 'sqs-message-6' },
          { itemIdentifier: 'sqs-message-8' },
        ],
      })
    })
  })
})
