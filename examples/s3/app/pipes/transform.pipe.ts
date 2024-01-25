import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class TransformPipe implements PipeTransform {
  public transform(value: any, _metadata: ArgumentMetadata) {
    return this.tryParseJson<any>(value)
  }

  protected tryParseJson<T>(value: string): T | string {
    try {
      return JSON.parse(value)
    } catch (_error: unknown) {
      return value
    }
  }
}
