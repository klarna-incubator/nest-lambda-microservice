// https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html

import { APIGatewayEvent } from 'aws-lambda'

export const isApiGatewayEvent = (event: unknown): event is APIGatewayEvent => {
  return (
    event !== null &&
    typeof event === 'object' &&
    'httpMethod' in event &&
    'path' in event &&
    'isBase64Encoded' in event
  )
}
