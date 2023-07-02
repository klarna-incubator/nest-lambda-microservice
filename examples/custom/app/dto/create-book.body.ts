import { IsString } from 'class-validator'

export class CreateBookBody {
  @IsString()
  public title: string
}
