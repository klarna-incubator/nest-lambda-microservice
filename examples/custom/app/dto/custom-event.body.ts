import { IsString } from 'class-validator'

import { CreateBookBody } from './create-book.body'
import { DeleteBookByIdParams } from './delete-book-by-id.params'
import { ListBooksQuery } from './list-books.query'

export class CustomEventBody {
  @IsString()
  operation: 'createBook' | 'listBooks' | 'deleteBook'

  // Transform/Validation skipped for brevity
  body: CreateBookBody | ListBooksQuery | DeleteBookByIdParams
}
