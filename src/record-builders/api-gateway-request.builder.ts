import { Context } from 'aws-lambda'

import { OutgoingApiGatewayRequest, RequestBuilder } from '../interfaces'
import { AnyAPIGatewayEvent, isApiGatewayEventV1, isApiGatewayEventV2 } from '../lambda'

export interface ApiGatewayPattern {
  httpMethod: string
  resource: string
  queryStringParameters: Record<string, unknown> | null
  pathParameters: Record<string, unknown> | null
}

export class ApiGatewayRequestBuilder implements RequestBuilder {
  public static buildPattern(data: AnyAPIGatewayEvent): ApiGatewayPattern {
    if (isApiGatewayEventV1(data)) {
      return {
        httpMethod: data.httpMethod,
        resource: data.resource,
        queryStringParameters: data.queryStringParameters,
        pathParameters: data.pathParameters,
      }
    }

    if (isApiGatewayEventV2(data)) {
      const [httpMethod, resource] = data.routeKey.split(' ')

      return {
        httpMethod: httpMethod,
        resource: resource,
        queryStringParameters: data.queryStringParameters ?? null,
        pathParameters: data.pathParameters ?? null,
      }
    }

    throw new Error('Unknown API Gateway event type')
  }

  protected pattern: ApiGatewayPattern

  constructor(protected readonly data: AnyAPIGatewayEvent, protected readonly context: Context) {
    this.pattern = ApiGatewayRequestBuilder.buildPattern(this.data)
  }

  public build(): OutgoingApiGatewayRequest {
    return {
      id: this.data.requestContext.requestId,
      pattern: this.pattern,
      data: this.data,
      context: this.context,
    }
  }
}
