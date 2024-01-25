import { IsString } from 'class-validator'

export class DeleteBookByIdParams {
  @IsString()
  id: string
}
