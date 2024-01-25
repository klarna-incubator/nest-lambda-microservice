import { S3Event } from 'aws-lambda'

export const makeS3Event = (eventName?: string, bucketName?: string, objectKey?: string): S3Event => ({
  Records: [
    {
      eventVersion: '2.1',
      eventSource: 'aws:s3',
      awsRegion: 'eu-west-1',
      eventTime: '2021-08-01T15:31:16Z',
      eventName: eventName ?? 'ObjectCreated:Put',
      userIdentity: {
        principalId: 'AWS_ACCOUNT_ID',
      },
      requestParameters: {
        sourceIPAddress: '127.0.0.1',
      },
      responseElements: {
        'x-amz-request-id': '3E3B8C03E43A2D50',
        'x-amz-id-2': 'BsPldZlNJCo6EyszYhwDY/Ab28rK53OEXAMPLE',
      },
      s3: {
        s3SchemaVersion: '1.0',
        configurationId: 'testConfigRule',
        bucket: {
          name: bucketName ?? 'example-bucket',
          ownerIdentity: {
            principalId: 'AWS_ACCOUNT_ID',
          },
          arn: 'arn:aws:s3:::example-bucket',
        },
        object: {
          key: objectKey ?? 'example-object',
          size: 1024,
          eTag: 'cf5714d4b045519ffe5102e7ebc72EXAMPLE',
          sequencer: '0061FA57082A4D4A72',
        },
      },
    },
  ],
})
