// https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents.html

import { EventBridgeEvent } from 'aws-lambda'

export { EventBridgeEvent } from 'aws-lambda'

export type JSONValue = string | number | boolean | JSONObject | JSONArray | Record<never, never>
interface JSONObject {
  [x: string]: JSONValue
}
type JSONArray = Array<JSONValue>

export type AnyEventBridgeEvent = EventBridgeEvent<string, JSONValue>
export type EventBridgeCronEvent = EventBridgeEvent<'Scheduled Event', Record<string, unknown>>

export const isEventBridgeEvent = (event: unknown): event is AnyEventBridgeEvent => {
  return (
    event !== null &&
    typeof event === 'object' &&
    'source' in event &&
    typeof event.source === 'string' &&
    'detail-type' in event &&
    typeof event['detail-type'] === 'string'
  )
}
