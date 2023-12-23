// https://docs.aws.amazon.com/lambda/latest/dg/with-sns.html

import { SNSEvent, SNSEventRecord, SNSMessage } from 'aws-lambda'

export const isSnsMessage = (payload: unknown): payload is SNSMessage => {
  return (
    payload !== null &&
    typeof payload === 'object' &&
    'Type' in payload &&
    'TopicArn' in payload &&
    typeof payload.TopicArn === 'string' &&
    payload?.Type === 'Notification' &&
    payload?.TopicArn?.startsWith('arn:aws:sns')
  )
}

export const isSnsRecord = (record: unknown): record is SNSEventRecord => {
  return record !== null && typeof record === 'object' && 'EventSource' in record && record?.EventSource === 'aws:sns'
}

export const isSnsEvent = (event: unknown): event is SNSEvent => {
  return (
    event !== null &&
    typeof event === 'object' &&
    'Records' in event &&
    Array.isArray(event?.Records) &&
    event.Records.every(isSnsRecord)
  )
}
