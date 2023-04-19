import { Context } from 'aws-lambda'

import { AnyEventBridgeEvent, JSONValue } from '../lambda'
import { OutgoingEventBridgeRequest, RequestBuilder } from '../interfaces'

export interface EventBridgePattern {
  source: string
  detailType: string
  detail: JSONValue
}

export class EventBridgeRequestBuilder implements RequestBuilder {
  public static buildPattern(data: AnyEventBridgeEvent): EventBridgePattern {
    return {
      source: data.source,
      detailType: data['detail-type'],
      detail: data.detail,
    }
  }

  protected pattern: EventBridgePattern

  constructor(protected readonly data: AnyEventBridgeEvent, protected readonly context: Context) {
    this.pattern = EventBridgeRequestBuilder.buildPattern(this.data)
  }

  public build(): OutgoingEventBridgeRequest {
    return {
      id: this.data.id,
      pattern: this.pattern,
      data: this.data,
      context: this.context,
    }
  }
}
