// https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html

import { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda'

export const isKinesisRecord = (record: any): record is KinesisStreamRecord => {
  return record?.eventSource === 'aws:kinesis'
}

export const isKinesisEvent = (event: any): event is KinesisStreamEvent => {
  return event && typeof event === 'object' && Array.isArray(event?.Records) && event.Records.every(isKinesisRecord)
}
