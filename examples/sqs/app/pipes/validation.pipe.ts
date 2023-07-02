import { ValidationError, ValidationPipe as NestValidationPipe } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

export const ValidationPipeFactory = (): NestValidationPipe => {
  return new NestValidationPipe({
    transform: true,
    exceptionFactory: (errors: ValidationError[]): never => {
      throw new RpcException(
        `The request failed validation due to errors in ${errors.map(({ property }) => property).join(', ')}`,
      )
    },
  })
}
