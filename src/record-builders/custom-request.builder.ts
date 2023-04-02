import { Context } from 'aws-lambda'
import { v4 } from 'uuid'

import { OutgoingCustomRequest, RequestBuilder } from '../interfaces'

export type CustomRecordPattern = '/'

export class CustomRequestBuilder implements RequestBuilder {
  protected pattern: CustomRecordPattern = '/'

  constructor(protected readonly data: unknown, protected readonly context: Context) {}

  public build(): OutgoingCustomRequest {
    return {
      id: v4(),
      pattern: this.pattern,
      data: this.data,
      context: this.context,
    }
  }
}
