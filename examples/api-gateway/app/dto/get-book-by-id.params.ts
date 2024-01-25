import { IsString } from 'class-validator'

export class GetBookByIdParams {
  @IsString()
  id: string
}
