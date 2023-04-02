// https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents.html

import { EventBridgeEvent } from 'aws-lambda'

export type EventBridgeCronEvent = EventBridgeEvent<'Scheduled Event', Record<string, unknown>>

export const isScheduledEventBridgeEvent = (event: any): event is EventBridgeCronEvent => {
  return event && typeof event === 'object' && event?.source === 'aws.events'
}
