import { Injectable, Scope } from '@nestjs/common'
import { v4 } from 'uuid'

export interface Book {
  id: string
  title: string
}

@Injectable({ scope: Scope.DEFAULT })
export class BooksService {
  protected books = new Map<string, Book>()
  public async saveNewBook(title: string) {
    const book = { id: v4(), title }

    this.books.set(book.id, book)

    return book
  }

  public async listBooks(filter: (book: Book) => boolean = () => true) {
    return Promise.resolve(Array.from(this.books.values()).filter(filter))
  }

  public async getBookById(id: string): Promise<Book | void> {
    return Promise.resolve(this.books.get(id))
  }

  public async deleteBookById(id: string): Promise<boolean> {
    return this.books.delete(id)
  }

  public async deleteBookByTitle(title: string): Promise<boolean> {
    const books = await this.listBooks((book) => book.title === title)

    return books.map((book) => this.books.delete(book.id)).reduce((acc, val) => val || acc, false)
  }
}
