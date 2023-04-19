// https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html

import { APIGatewayEvent, APIGatewayProxyEventV2 } from 'aws-lambda'

export type AnyAPIGatewayEvent = APIGatewayEvent | APIGatewayProxyEventV2

export const isApiGatewayEvent = (event: unknown): event is AnyAPIGatewayEvent => {
  return isApiGatewayEventV1(event) || isApiGatewayEventV2(event)
}

export const isApiGatewayEventV1 = (event: unknown): event is APIGatewayEvent => {
  return (
    event !== null &&
    typeof event === 'object' &&
    'requestContext' in event &&
    'httpMethod' in event &&
    'path' in event &&
    'isBase64Encoded' in event
  )
}

export const isApiGatewayEventV2 = (event: unknown): event is APIGatewayProxyEventV2 => {
  return (
    event !== null &&
    typeof event === 'object' &&
    'requestContext' in event &&
    'routeKey' in event &&
    'rawPath' in event &&
    'isBase64Encoded' in event
  )
}
