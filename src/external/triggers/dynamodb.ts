// https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html

import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda'

export const isDynamoDbRecord = (record: any): record is DynamoDBRecord => {
  return record?.eventSource === 'aws:dynamodb'
}

export const isDynamoDbEvent = (event: any): event is DynamoDBStreamEvent => {
  return event && typeof event === 'object' && Array.isArray(event?.Records) && event.Records.every(isDynamoDbRecord)
}
