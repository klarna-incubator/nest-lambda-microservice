import { IncomingResponseError } from '../errors'
import { ResponseBuilder, ResponseTuple } from '../interfaces'

export class EventBridgeResponseBuilder implements ResponseBuilder {
  constructor(protected readonly responseTuples: ResponseTuple[]) {}

  public build() {
    for (const [_request, response] of this.responseTuples) {
      if (response instanceof IncomingResponseError) {
        throw response.cause
      }
    }

    // EventBridge does not expect any response
    return undefined
  }
}
