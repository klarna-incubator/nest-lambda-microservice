import { RpcException } from '@nestjs/microservices'
import { Context } from 'aws-lambda'

import { OutgoingRequest, ResponseTuple } from '../interfaces'
import {
  CustomRequestBuilder,
  CustomResponseBuilder,
  EventBridgeRequestBuilder,
  EventBridgeResponseBuilder,
  SnsRequestBuilder,
  SnsResponseBuilder,
  SqsRequestBuilder,
  SqsResponseBuilder,
} from '../record-builders'
import {
  isApiGatewayEvent,
  isDynamoDbEvent,
  isKinesisEvent,
  isS3Event,
  isScheduledEventBridgeEvent,
  isSnsEvent,
  isSqsEvent,
} from './triggers'

export class LambdaEventSourceMapper {
  public mapEventToRequest(event: unknown, context: Context): OutgoingRequest | OutgoingRequest[] {
    if (isApiGatewayEvent(event)) {
      this.throwNotImplementedError('Api Gateway')
    }

    if (isDynamoDbEvent(event)) {
      this.throwNotImplementedError('Dynamo Db')
    }

    if (isScheduledEventBridgeEvent(event)) {
      return new EventBridgeRequestBuilder(event, context).build()
    }

    if (isKinesisEvent(event)) {
      this.throwNotImplementedError('Kinesis')
    }

    if (isS3Event(event)) {
      this.throwNotImplementedError('S3')
    }

    if (isSnsEvent(event)) {
      return event.Records.map((record) => {
        return new SnsRequestBuilder(record, context).build()
      })
    }

    if (isSqsEvent(event)) {
      return event.Records.map((record) => {
        return new SqsRequestBuilder(record, context).build()
      })
    }

    return new CustomRequestBuilder(event, context).build()
  }

  public mapToLambdaResponse(event: unknown, responseTuples: ResponseTuple[]) {
    if (isApiGatewayEvent(event)) {
      this.throwNotImplementedError('Api Gateway')
    }

    if (isDynamoDbEvent(event)) {
      this.throwNotImplementedError('Dynamo Db')
    }

    if (isScheduledEventBridgeEvent(event)) {
      return new EventBridgeResponseBuilder(responseTuples).build()
    }

    if (isKinesisEvent(event)) {
      this.throwNotImplementedError('Kinesis')
    }

    if (isS3Event(event)) {
      this.throwNotImplementedError('S3')
    }

    if (isSnsEvent(event)) {
      return new SnsResponseBuilder(responseTuples).build()
    }

    if (isSqsEvent(event)) {
      return new SqsResponseBuilder(responseTuples).build()
    }

    // return responseTuples.length === 1 ? responseTuples[0] : responseTuples
    return new CustomResponseBuilder(responseTuples).build()
  }

  protected throwNotImplementedError(eventType: string): void {
    throw new RpcException(`Event source ${eventType} not implemented`)
  }
}
