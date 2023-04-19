import { SNSMessageAttributes, SQSEvent, SQSMessageAttributes } from 'aws-lambda'

export const makeSqsEvent = (messageAttributes: SQSMessageAttributes = {}): SQSEvent => ({
  Records: [
    {
      messageId: '059f36b4-87a3-44ab-83d0-661in5c3fe1k',
      receiptHandle: 'AQEBJQ+u6WoZzl24wUIPQUasdA3ez3k2N5N5ue5zirS5OpvYRBALRMSptGZVwIjl4',
      body: 'Hello from SQS!',
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1628855605446',
        SenderId: 'AWS_ACCOUNT_ID',
        ApproximateFirstReceiveTimestamp: '1628855605546',
      },
      messageAttributes: messageAttributes,
      md5OfBody: '449e3bfa97795476fb69bcbe119d287b',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:eu-west-1:AWS_ACCOUNT_ID:MyQueue',
      awsRegion: 'eu-west-1',
    },
  ],
})

export const makeSnsSqsEvent = (messageAttributes: SNSMessageAttributes = {}): SQSEvent => ({
  Records: [
    {
      messageId: '059f36b4-87a3-44ab-83d0-661in5c3fe1k',
      receiptHandle: 'AQEBwJnks54fdr78cPGM9pX9EXAMPLE',
      body: JSON.stringify({
        Type: 'Notification',
        messageId: '95df01b4-ee98-5cb9-9903-4c221d41eb5e',
        TopicArn: 'arn:aws:sns:eu-west-1:AWS_ACCOUNT_ID:MyTopic',
        Subject: 'Example subject',
        Message: JSON.stringify({
          name: 'John Doe',
          email: 'john.doe@example.com',
        }),
        Timestamp: '1970-01-01T00:00:00.000Z',
        SignatureVersion: '1',
        Signature: 'EXAMPLE',
        SigningCertUrl: 'EXAMPLE',
        UnsubscribeUrl: 'EXAMPLE',
        MessageAttributes: messageAttributes,
      }),
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1628855605446',
        SenderId: 'AWS_ACCOUNT_ID',
        ApproximateFirstReceiveTimestamp: '1628855605546',
      },
      messageAttributes: {},
      md5OfBody: 'e4e68fb7bd0e697a0ae8f1bb342846b3',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:eu-west-1:AWS_ACCOUNT_ID:MyQueue',
      awsRegion: 'eu-west-1',
    },
  ],
})
