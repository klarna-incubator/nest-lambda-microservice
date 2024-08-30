import { EventBridgePattern, UsePartialPatternMatch } from '@klarna/nest-lambda-microservice'
import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'

import { CreateBookBody, DeleteBookByIdParams, ListBooksQuery } from '../dto'
import { BooksService } from '../providers'

@Controller()
@UsePartialPatternMatch()
export class BooksController {
  constructor(protected readonly booksService: BooksService) {}

  @MessagePattern<Partial<EventBridgePattern>>({ detailType: 'CreateBook' }) // Custom event bridge event
  public async createBook(@Payload('detail') eventBridgeDetail: CreateBookBody) {
    // The transform pipe parsed the serialised sqs record body
    await this.booksService.saveNewBook(eventBridgeDetail.title)
  }

  @MessagePattern<Partial<EventBridgePattern>>({ detailType: 'ListBooks' }) // Custom event bridge event
  public async listBooks(@Payload('detail') eventBridgeDetail: ListBooksQuery) {
    await this.booksService.listBooks((book) => book.title.startsWith(eventBridgeDetail?.startsWith ?? ''))
  }

  @MessagePattern<Partial<EventBridgePattern>>({ detailType: 'DeleteBook' }) // Custom event bridge event
  public async deleteBookById(@Payload('detail') eventBridgeDetail: DeleteBookByIdParams) {
    // The transform pipe parsed the serialised sqs record body
    await this.booksService.deleteBookById(eventBridgeDetail.id)
  }
}
