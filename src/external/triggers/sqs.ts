// https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html

import { SNSMessage, SQSEvent, SQSRecord } from 'aws-lambda'

import { isSnsMessage } from './sns'

export const isSqsRecord = (record: any): record is SQSRecord => {
  return record?.eventSource === 'aws:sqs'
}

export const isSqsEvent = (event: any): event is SQSEvent => {
  return event && typeof event === 'object' && Array.isArray(event?.Records) && event.Records.every(isSqsRecord)
}

export const tryUnwrapSnsMessageFromSqsRecord = (record: SQSRecord): SNSMessage | never => {
  const parsedBody = JSON.parse(record.body)

  if (!isSnsMessage(parsedBody)) {
    throw new Error('The SQS Record body is not a serialised SNS Message')
  }

  return parsedBody
}

export const isSqsRecordWithEmbeddedSnsMessage = (record: any): record is SQSRecord => {
  if (!isSqsRecord(record)) {
    return false
  }

  try {
    tryUnwrapSnsMessageFromSqsRecord(record)

    return true
  } catch (error: unknown) {
    return false
  }
}
