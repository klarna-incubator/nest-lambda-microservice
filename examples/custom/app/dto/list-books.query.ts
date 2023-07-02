import { IsOptional, IsString } from 'class-validator'

export class ListBooksQuery {
  @IsOptional()
  @IsString()
  startsWith?: string
}
