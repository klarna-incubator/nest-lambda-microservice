import { Inject, Injectable, Scope } from '@nestjs/common'
import { CONTEXT, RequestContext } from '@nestjs/microservices'

@Injectable({ scope: Scope.REQUEST })
export class ScenariosService {
  constructor(@Inject(CONTEXT) private ctx: RequestContext) {}

  public getPattern() {
    return this.ctx.getPattern()
  }

  public getEventData() {
    return this.ctx.getData()
  }
}
