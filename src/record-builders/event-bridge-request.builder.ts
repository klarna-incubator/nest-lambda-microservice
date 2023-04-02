import { Context } from 'aws-lambda'

import { EventBridgeCronEvent } from '../external'
import { OutgoingEventBridgeRequest, RequestBuilder } from '../interfaces'

export type EventBridgePattern = unknown

export class EventBridgeRequestBuilder implements RequestBuilder {
  public static buildPattern(data: EventBridgeCronEvent): EventBridgePattern {
    return data['detail']
  }

  protected pattern: EventBridgePattern = {}

  constructor(protected readonly data: EventBridgeCronEvent, protected readonly context: Context) {
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
