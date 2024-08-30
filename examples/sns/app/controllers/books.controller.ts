import { SnsRecordPattern, SqsRecordPattern, UsePartialPatternMatch } from '@klarna/nest-lambda-microservice'
import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'

import { CreateBookBody, DeleteBookByIdParams, ListBooksQuery } from '../dto'
import { BooksService } from '../providers'

@Controller()
@UsePartialPatternMatch()
export class BooksController {
  constructor(protected readonly booksService: BooksService) {}

  @MessagePattern<Partial<SnsRecordPattern>>({ Operation: 'CreateBook' }) // Can be anything set on the SNS Record attributes
  public async createBook(@Payload('Message') snsMessage: CreateBookBody) {
    // The transform pipe parsed the serialised sns message
    await this.booksService.saveNewBook(snsMessage.title)
  }

  @MessagePattern<Partial<SqsRecordPattern>>({ Operation: 'ListBooks' }) // Can be anything set on the SNS Record attributes
  public async listBooks(@Payload('Message') snsMessage: ListBooksQuery) {
    await this.booksService.listBooks((book) => book.title.startsWith(snsMessage?.startsWith ?? ''))
  }

  @MessagePattern<Partial<SqsRecordPattern>>({ Operation: 'DeleteBook' }) // Can be anything set on the SNS Record attributes
  public async deleteBookById(@Payload('Message') snsMessage: DeleteBookByIdParams) {
    // The transform pipe parsed the serialised sns message
    await this.booksService.deleteBookById(snsMessage.id)
  }
}
