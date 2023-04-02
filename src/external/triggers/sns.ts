// https://docs.aws.amazon.com/lambda/latest/dg/with-sns.html

import { SNSEvent, SNSEventRecord, SNSMessage } from 'aws-lambda'

export const isSnsMessage = (payload: any): payload is SNSMessage => {
  return payload?.Type === 'Notification' && payload?.TopicArn?.startsWith('arn:aws:sns')
}

export const isSnsRecord = (record: any): record is SNSEventRecord => {
  return record?.EventSource === 'aws:sns'
}

export const isSnsEvent = (event: any): event is SNSEvent => {
  return event && typeof event === 'object' && Array.isArray(event?.Records) && event.Records.every(isSnsRecord)
}
