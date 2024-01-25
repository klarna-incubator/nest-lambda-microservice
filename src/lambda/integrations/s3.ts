// https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html

import { S3Event, S3EventRecord } from 'aws-lambda'

export const isS3Record = (record: unknown): record is S3EventRecord => {
  return record !== null && typeof record === 'object' && 'eventSource' in record && record?.eventSource === 'aws:s3'
}

export const isS3Event = (event: unknown): event is S3Event => {
  return (
    event !== null &&
    typeof event === 'object' &&
    'Records' in event &&
    Array.isArray(event?.Records) &&
    event.Records.every(isS3Record)
  )
}
