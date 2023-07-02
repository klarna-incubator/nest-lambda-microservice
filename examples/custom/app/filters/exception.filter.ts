import { ArgumentsHost, Catch, ExceptionFilter as BaseExceptionFilter } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'

@Catch()
export class ExceptionFilter implements BaseExceptionFilter<Error> {
  public catch(exception: Error, host: ArgumentsHost): Observable<any> {
    const request = host.switchToRpc().getData()

    const errorMessage = this.getExceptionMessage(exception)
    const errorCode = this.getExceptionCode(exception)

    console.error(`Request processing failed`, { request, exception })

    return throwError(() => ({
      statusCode: 500,
      body: JSON.stringify({ errorCode, errorMessage }),
    }))
  }

  protected getExceptionMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message
    }

    return 'Unknown exception'
  }

  protected getExceptionCode(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.constructor.name
    }

    return 'UNKNOWN'
  }
}
