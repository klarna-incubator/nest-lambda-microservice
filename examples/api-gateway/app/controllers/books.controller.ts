import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { ApiGatewayPattern, UsePartialPatternMatch } from '@klarna/nest-lambda-microservice'

import { Book, BooksService } from '../providers'
import { CreateBookBody, GetBookByIdParams, ListBooksQuery } from '../dto'

@Controller()
@UsePartialPatternMatch()
export class BooksController {
  constructor(protected readonly booksService: BooksService) {}

  @MessagePattern<Partial<ApiGatewayPattern>>({
    httpMethod: 'POST',
    resource: '/books',
  })
  public async createBook(@Payload('body') { title }: CreateBookBody) {
    const book = await this.booksService.saveNewBook(title)

    return { statusCode: 201, body: JSON.stringify(book) }
  }

  @MessagePattern<Partial<ApiGatewayPattern>>({
    httpMethod: 'GET',
    resource: '/books',
  })
  public async listBooks(@Payload('queryStringParameters') { startsWith = '' }: ListBooksQuery) {
    const books = await this.booksService.listBooks((book: Book) => book.title.startsWith(startsWith))

    return { statusCode: 200, body: JSON.stringify(books) }
  }

  @MessagePattern<Partial<ApiGatewayPattern>>({
    httpMethod: 'GET',
    resource: '/books/{id}',
  })
  public async getBook(@Payload('pathParameters') { id }: GetBookByIdParams) {
    const book = await this.booksService.getBookById(id)

    if (!book) {
      return {
        statusCode: 404,
        body: JSON.stringify({ errorCode: 'NOT_FOUND', errorMessage: 'Requested book not found' }),
      }
    }

    return { statusCode: 200, body: JSON.stringify(book) }
  }
}
