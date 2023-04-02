import { SNSMessageAttributes, SQSMessageAttributes, SQSRecord } from 'aws-lambda'
import { v4 } from 'uuid'

export const sqsRecordFactory = (
  attributes: SQSMessageAttributes,
  payload: string = JSON.stringify({
    prop: 'Hello World',
  }),
): SQSRecord => ({
  messageId: v4(),
  receiptHandle: 'MA==',
  body: payload,
  attributes: {
    ApproximateReceiveCount: '1',
    SentTimestamp: '946684800001',
    SenderId: 'AIDAIVEA3AGEU7NF6DRAG',
    ApproximateFirstReceiveTimestamp: '946684800001',
  },
  messageAttributes: { ...attributes },
  md5OfBody: '9e4be8d49e443577d8d883e203e3b64a',
  eventSource: 'aws:sqs',
  eventSourceARN: 'arn:aws:sqs:eu-west-1:000000000000:TestQueue',
  awsRegion: 'eu-west-1',
})

export const sqsRecordEnvelopedSnsMessageFactory = (
  snsMessageAttributes: SNSMessageAttributes,
  snsMessage: string = JSON.stringify({
    prop: 'Hello World',
  }),
): SQSRecord => ({
  messageId: v4(),
  receiptHandle: 'MA==',
  body: JSON.stringify({
    Type: 'Notification',
    MessageId: v4(),
    TopicArn: 'arn:aws:sns:eu-west-1:000000000000:TestTopic',
    Subject: 'SubjectOptionalValue',
    Message: snsMessage,
    Timestamp: '2022-10-30T09:59:47.985Z',
    SignatureVersion: '1',
    Signature: 'MA==',
    SigningCertURL: 'https://sns.eu-west-1.amazonaws.com/SimpleNotificationService.pem',
    UnsubscribeURL:
      'https://sns.eu-west-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-1:000000000000:TestTopic:59aca43e-bdff-4652-a452-719ffd5466b5',
    MessageAttributes: snsMessageAttributes,
  }),
  attributes: {
    ApproximateReceiveCount: '1',
    SentTimestamp: '946684800001',
    SenderId: 'AIDAIVEA3AGEU7NF6DRAG',
    ApproximateFirstReceiveTimestamp: '946684800001',
  },
  messageAttributes: {},
  md5OfBody: '9e4be8d49e443577d8d883e203e3b64a',
  eventSource: 'aws:sqs',
  eventSourceARN: 'arn:aws:sqs:eu-west-1:000000000000:TestQueue',
  awsRegion: 'eu-west-1',
})
