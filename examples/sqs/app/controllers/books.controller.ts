import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { SqsRecordPattern, UsePartialPatternMatch } from '@klarna/nest-lambda-microservice'

import { BooksService } from '../providers'
import { ListBooksQuery, DeleteBookByIdParams, CreateBookBody } from '../dto'

@Controller()
@UsePartialPatternMatch()
export class BooksController {
  constructor(protected readonly booksService: BooksService) {}

  @MessagePattern<Partial<SqsRecordPattern>>({ Operation: 'CreateBook' }) // Can be anything set on the SQS Record attributes
  public async createBook(@Payload('body') sqsRecordBody: CreateBookBody) {
    // The transform pipe parsed the serialised sqs record body
    await this.booksService.saveNewBook(sqsRecordBody.title)
  }

  @MessagePattern<Partial<SqsRecordPattern>>({ Operation: 'ListBooks' }) // Can be anything set on the SQS Record attributes
  public async listBooks(@Payload('body') sqsRecordBody: ListBooksQuery) {
    await this.booksService.listBooks((book) => book.title.startsWith(sqsRecordBody?.startsWith ?? ''))
  }

  @MessagePattern<Partial<SqsRecordPattern>>({ Operation: 'DeleteBook' }) // Can be anything set on the SQS Record attributes
  public async deleteBookById(@Payload('body') sqsRecordBody: DeleteBookByIdParams) {
    // The transform pipe parsed the serialised sqs record body
    await this.booksService.deleteBookById(sqsRecordBody.id)
  }
}
