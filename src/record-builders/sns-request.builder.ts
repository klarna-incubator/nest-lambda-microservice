import { Context, SNSMessage, SNSMessageAttribute } from 'aws-lambda'
import { SNSEventRecord } from 'aws-lambda/trigger/sns'

import { OutgoingSnsRequest, RequestBuilder } from '../interfaces'

export interface SnsRecordPattern {
  [key: string]: string | number
}

export class SnsRequestBuilder implements RequestBuilder {
  public static buildPattern(data: SNSEventRecord): SnsRecordPattern {
    return SnsRequestBuilder.buildSnsMessagePattern(data.Sns)
  }

  public static buildSnsMessagePattern(data: SNSMessage): SnsRecordPattern {
    const pattern: SnsRecordPattern = {}
    const messageAttrs = data.MessageAttributes

    return Reflect.ownKeys(messageAttrs).reduce((pattern, key) => {
      Reflect.set(pattern, key, SnsRequestBuilder.mapSnsMessageAttributes(Reflect.get(messageAttrs, key)))

      return pattern
    }, pattern)
  }

  public static mapSnsMessageAttributes(messageAttribute: SNSMessageAttribute): string | number {
    switch (messageAttribute.Type) {
      case 'String':
        try {
          return messageAttribute.Value ? JSON.parse(messageAttribute.Value) : ''
        } catch (_error: any) {
          return messageAttribute.Value ?? ''
        }
      case 'String.Array':
        return messageAttribute.Value ? JSON.parse(messageAttribute.Value) : []
      case 'Number':
        return messageAttribute.Value ? JSON.parse(messageAttribute.Value) : 0
      case 'Binary':
      default:
        throw new Error('Attribute type not implemented')
    }
  }

  protected pattern: SnsRecordPattern = {}

  constructor(protected readonly data: SNSEventRecord, protected readonly context: Context) {
    this.pattern = SnsRequestBuilder.buildPattern(this.data)
  }

  public build(): OutgoingSnsRequest {
    return {
      id: this.data.Sns.MessageId,
      pattern: this.pattern,
      data: this.data.Sns,
      context: this.context,
    }
  }
}
