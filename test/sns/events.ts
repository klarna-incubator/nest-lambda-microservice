import { SNSEvent, SNSMessageAttributes } from 'aws-lambda'

export const makeSnsEvent = (messageAttributes: SNSMessageAttributes = {}): SNSEvent => ({
  Records: [
    {
      EventVersion: '1.0',
      EventSubscriptionArn: 'arn:aws:sns:EXAMPLE',
      EventSource: 'aws:sns',
      Sns: {
        Type: 'Notification',
        MessageId: '95df01b4-ee98-5cb9-9903-4c221d41eb5e',
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
      },
    },
  ],
})
