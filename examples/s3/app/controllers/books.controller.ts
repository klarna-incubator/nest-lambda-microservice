import { S3RecordPattern, UsePartialPatternMatch } from '@klarna/nest-lambda-microservice'
import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { S3EventRecord } from 'aws-lambda/trigger/s3'

import { BooksService } from '../providers'

@Controller()
@UsePartialPatternMatch()
export class BooksController {
  constructor(protected readonly booksService: BooksService) {}

  @MessagePattern<Partial<S3RecordPattern>>({
    eventName: 'ObjectCreated:Post',
    bucketName: 'books',
  })
  public async createBook(@Payload() { s3 }: S3EventRecord) {
    await this.booksService.saveNewBook(s3.object.key)
  }

  @MessagePattern<Partial<S3RecordPattern>>({
    eventName: 'ObjectRemoved:Delete',
    bucketName: 'books',
  })
  public async removeBook(@Payload() { s3 }: S3EventRecord) {
    await this.booksService.deleteBookByTitle(s3.object.key)
  }
}
