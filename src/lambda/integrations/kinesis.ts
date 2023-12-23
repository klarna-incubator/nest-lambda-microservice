// https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html

import { KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda'

export const isKinesisRecord = (record: unknown): record is KinesisStreamRecord => {
  return (
    record !== null && typeof record === 'object' && 'eventSource' in record && record?.eventSource === 'aws:kinesis'
  )
}

export const isKinesisEvent = (event: unknown): event is KinesisStreamEvent => {
  return (
    event !== null &&
    typeof event === 'object' &&
    'Records' in event &&
    Array.isArray(event?.Records) &&
    event.Records.every(isKinesisRecord)
  )
}
