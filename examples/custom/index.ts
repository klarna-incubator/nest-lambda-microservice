import { Context } from 'aws-lambda'

import { getLambdaMicroserviceClient } from './service'

export const handler = async (event: unknown, context: Context) => {
  const client = await getLambdaMicroserviceClient()

  return await client.processEvent(event, context)
}
