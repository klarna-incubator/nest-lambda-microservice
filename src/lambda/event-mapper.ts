import { RpcException } from '@nestjs/microservices'
import { Context } from 'aws-lambda'

import { OutgoingRequest, ResponseTuple } from '../interfaces'
import {
  ApiGatewayRequestBuilder,
  ApiGatewayResponseBuilder,
  CustomRequestBuilder,
  CustomResponseBuilder,
  EventBridgeRequestBuilder,
  EventBridgeResponseBuilder,
  S3RequestBuilder,
  S3ResponseBuilder,
  SnsRequestBuilder,
  SnsResponseBuilder,
  SqsRequestBuilder,
  SqsResponseBuilder,
} from '../record-builders'

import { isApiGatewayEvent, isS3Event, isEventBridgeEvent, isSnsEvent, isSqsEvent } from './integrations'

export class EventMapper {
  public mapEventToRequest(event: unknown, context: Context): OutgoingRequest | OutgoingRequest[] {
    if (isApiGatewayEvent(event)) {
      return new ApiGatewayRequestBuilder(event, context).build()
    }

    if (isEventBridgeEvent(event)) {
      return new EventBridgeRequestBuilder(event, context).build()
    }

    if (isS3Event(event)) {
      return event.Records.map((record) => {
        return new S3RequestBuilder(record, context).build()
      })
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
      return new ApiGatewayResponseBuilder(responseTuples).build()
    }

    if (isEventBridgeEvent(event)) {
      return new EventBridgeResponseBuilder(responseTuples).build()
    }

    if (isS3Event(event)) {
      return new S3ResponseBuilder(responseTuples).build()
    }

    if (isSnsEvent(event)) {
      return new SnsResponseBuilder(responseTuples).build()
    }

    if (isSqsEvent(event)) {
      return new SqsResponseBuilder(responseTuples).build()
    }

    return new CustomResponseBuilder(responseTuples).build()
  }

  protected throwNotImplementedError(eventType: string): void {
    throw new RpcException(`Event source ${eventType} not implemented`)
  }
}
