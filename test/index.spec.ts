import { jest, describe, afterEach, it, expect } from '@jest/globals'

import { SqsResponseBuilder } from '../src'
import { handler, lambdaContextFactory, sqsRecordEnvelopedSnsMessageFactory, sqsRecordFactory } from './fixtures'
describe('LambdaMicroservice', () => {
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('when receiving a custom event', () => {
    it('should return the result if processing succeeds', async () => {
      const event = { hello: 'world' }

      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual('CustomEventScenario')
    })

    it('should throw if processing fails', async () => {
      const event = { throwError: true }

      await expect(() => handler(event, lambdaContextFactory())).rejects.toEqual({
        message: 'ThrowErrorScenario',
        status: 'error',
      })
    })
  })

  describe('when having SQS as event source', () => {
    it('should process an event with multiple records', async () => {
      const event = {
        Records: [
          sqsRecordFactory({
            scenario: { dataType: 'String', stringValue: 'exactPatternMatch' },
          }),
          sqsRecordFactory({
            scenario: { dataType: 'String', stringValue: 'partialPatternMatch' },
            otherProp: { dataType: 'String', stringValue: 'otherPropValue' },
          }),
          sqsRecordFactory({
            scenario: { dataType: 'String', stringValue: 'throwError' },
          }),
          sqsRecordFactory({
            scenario: { dataType: 'String', stringValue: 'noQualifiedHandler' },
          }),
        ],
      }
      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({
        batchItemFailures: [
          {
            itemIdentifier: event.Records[2].messageId,
          },
          {
            itemIdentifier: event.Records[3].messageId,
          },
        ].sort(SqsResponseBuilder.responseCompareFn),
      })
    })

    it('should process an event with multiple SNS message records', async () => {
      const event = {
        Records: [
          sqsRecordEnvelopedSnsMessageFactory({
            scenario: { Type: 'String', Value: 'exactPatternMatch' },
          }),
          sqsRecordEnvelopedSnsMessageFactory({
            scenario: { Type: 'String', Value: 'partialPatternMatch' },
            otherProp: { Type: 'String', Value: 'otherPropValue' },
          }),
          sqsRecordEnvelopedSnsMessageFactory({
            scenario: { Type: 'String', Value: 'throwError' },
          }),
          sqsRecordEnvelopedSnsMessageFactory({
            scenario: { Type: 'String', Value: 'noQualifiedHandler' },
          }),
        ],
      }
      const response = await handler(event, lambdaContextFactory())

      expect(response).toEqual({
        batchItemFailures: [
          {
            itemIdentifier: event.Records[2].messageId,
          },
          {
            itemIdentifier: event.Records[3].messageId,
          },
        ].sort(SqsResponseBuilder.responseCompareFn),
      })
    })
  })
})
