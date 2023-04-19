// https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html

import { S3Event, S3EventRecord } from 'aws-lambda'

export const isS3Record = (record: any): record is S3EventRecord => {
  return record?.eventSource === 'aws:s3'
}

export const isS3Event = (event: any): event is S3Event => {
  return event && typeof event === 'object' && Array.isArray(event?.Records) && event.Records.every(isS3Record)
}
