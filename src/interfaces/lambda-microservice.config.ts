import { CustomClientOptions } from '@nestjs/microservices'

import { LambdaMicroserviceClient } from '../client'
import { LambdaMicroserviceBroker } from '../server'

export interface LambdaMicroserviceOptions extends CustomClientOptions {
  customClass: typeof LambdaMicroserviceClient
  options: {
    broker: LambdaMicroserviceBroker
  }
}
