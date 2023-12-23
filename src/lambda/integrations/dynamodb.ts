// https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html

import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda'

export const isDynamoDbRecord = (record: unknown): record is DynamoDBRecord => {
  return (
    record !== null && typeof record === 'object' && 'eventSource' in record && record?.eventSource === 'aws:dynamodb'
  )
}

export const isDynamoDbEvent = (event: unknown): event is DynamoDBStreamEvent => {
  return (
    event !== null &&
    typeof event === 'object' &&
    'Records' in event &&
    Array.isArray(event?.Records) &&
    event.Records.every(isDynamoDbRecord)
  )
}
