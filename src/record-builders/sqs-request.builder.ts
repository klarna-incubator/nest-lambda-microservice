import { Context, SQSRecord } from 'aws-lambda'
import { SQSMessageAttribute } from 'aws-lambda/trigger/sqs'

import { tryUnwrapSnsMessageFromSqsRecord } from '../external'
import { OutgoingSqsRequest, RequestBuilder } from '../interfaces'
import { SnsRequestBuilder } from './sns-request.builder'

export interface SqsRecordPattern {
  [key: string]: string | number
}

export class SqsRequestBuilder implements RequestBuilder {
  public static buildPattern(data: SQSRecord): SqsRecordPattern {
    try {
      const snsMessage = tryUnwrapSnsMessageFromSqsRecord(data)

      return SnsRequestBuilder.buildSnsMessagePattern(snsMessage)
    } catch (_error: unknown) {
      return SqsRequestBuilder.buildSqsMessagePattern(data)
    }
  }

  public static buildSqsMessagePattern(data: SQSRecord): SqsRecordPattern {
    const pattern: SqsRecordPattern = {}
    const messageAttrs = data.messageAttributes

    return Reflect.ownKeys(messageAttrs).reduce((pattern, key) => {
      Reflect.set(pattern, key, SqsRequestBuilder.mapSqsMessageAttributes(Reflect.get(messageAttrs, key)))

      return pattern
    }, pattern)
  }

  public static mapSqsMessageAttributes(messageAttribute: SQSMessageAttribute): string | number {
    switch (messageAttribute.dataType) {
      case 'String':
        try {
          return messageAttribute.stringValue ? JSON.parse(messageAttribute.stringValue) : ''
        } catch (_error: any) {
          return messageAttribute.stringValue ?? ''
        }
      case 'String.Array':
        return messageAttribute.stringValue ? JSON.parse(messageAttribute.stringValue) : []
      case 'Number':
        return messageAttribute.stringValue ? JSON.parse(messageAttribute.stringValue) : 0
      case 'Binary':
      default:
        throw new Error('Attribute type not implemented')
    }
  }

  protected pattern: SqsRecordPattern = {}

  constructor(protected readonly data: SQSRecord, protected readonly context: Context) {
    this.pattern = SqsRequestBuilder.buildPattern(this.data)
  }

  public build(): OutgoingSqsRequest {
    return {
      id: this.data.messageId,
      pattern: this.pattern,
      data: this.data,
      context: this.context,
    }
  }
}
