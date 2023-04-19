import { Context, S3EventRecord } from 'aws-lambda'
import { v4 } from 'uuid'

import { OutgoingS3Request, RequestBuilder } from '../interfaces'

export interface S3RecordPattern {
  eventName: string
  bucketName: string
  objectKey: string
}

export class S3RequestBuilder implements RequestBuilder {
  public static buildPattern(data: S3EventRecord): S3RecordPattern {
    return {
      eventName: data.eventName,
      bucketName: data.s3.bucket.name,
      objectKey: data.s3.object.key,
    }
  }

  protected pattern: S3RecordPattern

  constructor(protected readonly data: S3EventRecord, protected readonly context: Context) {
    this.pattern = S3RequestBuilder.buildPattern(this.data)
  }

  public build(): OutgoingS3Request {
    return {
      id: v4(),
      pattern: this.pattern,
      data: this.data,
      context: this.context,
    }
  }
}
