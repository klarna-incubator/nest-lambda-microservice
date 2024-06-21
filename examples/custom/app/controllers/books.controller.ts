import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { CustomRecordPattern, UsePartialPatternMatch } from '@klarna/nest-lambda-microservice'

import { BooksService } from '../providers'
import { CustomEventBody } from '../dto'

@Controller()
@UsePartialPatternMatch()
export class BooksController {
  constructor(protected readonly booksService: BooksService) {}

  @MessagePattern<CustomRecordPattern>('*') // The custom lambda event can be processed only in a catch-all handler, hence not very useful when building rich lambda based applications
  public async createBook(@Payload() customEvent: CustomEventBody) {
    switch (customEvent.operation) {
      case 'createBook':
        return await this.booksService.saveNewBook(customEvent.body as any)
      case 'listBooks':
        return await this.booksService.listBooks((book) =>
          book.title.startsWith((customEvent.body as any)?.startsWith ?? ''),
        )
      case 'deleteBook':
        return await this.booksService.deleteBookById(customEvent.body as any)
    }
  }
}
