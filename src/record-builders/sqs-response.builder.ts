import { SQSBatchItemFailure } from 'aws-lambda/trigger/sqs'

import { IncomingResponseError } from '../errors'
import { ResponseBuilder, ResponseTuple } from '../interfaces'

export class SqsResponseBuilder implements ResponseBuilder {
  public static isSQSBatchItemFailure = (item: unknown): item is SQSBatchItemFailure =>
    typeof item === 'object' && item !== null && 'itemIdentifier' in item && Boolean(item?.itemIdentifier)

  public static responseCompareFn = (a: SQSBatchItemFailure, b: SQSBatchItemFailure) =>
    (a?.itemIdentifier ?? '').localeCompare(b?.itemIdentifier ?? '')

  constructor(protected readonly responseTuples: ResponseTuple[]) {}

  public build() {
    // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
    return {
      batchItemFailures: this.responseTuples
        .map(([request, response]) => ({
          itemIdentifier: response instanceof IncomingResponseError ? request.id : null,
        }))
        .filter(SqsResponseBuilder.isSQSBatchItemFailure)

        .sort(SqsResponseBuilder.responseCompareFn),
    }
  }
}
