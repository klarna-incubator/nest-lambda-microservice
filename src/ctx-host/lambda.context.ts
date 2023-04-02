import { BaseRpcContext } from '@nestjs/microservices'
import { LoggerService } from '@nestjs/common/services/logger.service'
import { Context } from 'aws-lambda'

export type LambdaContextArgs = [context: Context]

export class LambdaContext<T extends LoggerService> extends BaseRpcContext<LambdaContextArgs> {
  protected logger?: T

  public getLambdaInvocationContext(): Context {
    return this.args[0]
  }

  public setLogger(logger: T): this {
    this.logger = logger

    return this
  }

  public getLogger(): T | void {
    return this.logger
  }
}
