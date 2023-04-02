import { Controller } from '@nestjs/common'
import { MessagePattern, RpcException } from '@nestjs/microservices'

import { ScenariosService } from './scenarios.service'

@Controller()
export class ScenariosController {
  constructor(protected readonly scenariosService: ScenariosService) {}

  @MessagePattern({ scenario: 'exactPatternMatch' })
  public async handleExactMatchScenario() {
    return 'ExactMatchScenarioResult'
  }

  @MessagePattern({ scenario: 'partialPatternMatch' }, { partialMatch: true })
  public async handlePartialMatchScenario() {
    return 'PartialMatchScenario'
  }

  @MessagePattern('/')
  public async handleCustomEvents() {
    const payload = this.scenariosService.getEventData()

    if (payload?.throwError) {
      throw new RpcException('ThrowErrorScenario')
    }

    return 'CustomEventScenario'
  }

  @MessagePattern({ scenario: 'throwError' })
  public async handleThrowErrorScenario() {
    throw new RpcException('ThrowErrorScenario')
  }
}
