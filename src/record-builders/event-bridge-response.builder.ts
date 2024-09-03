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

    if (!this.responseTuples.length) {
      return undefined
    }

    if (this.responseTuples.length > 1) {
      return this.responseTuples.map((tuple) => tuple[1])
    }

    const tuple = this.responseTuples[0]

    return tuple[1]
  }
}
