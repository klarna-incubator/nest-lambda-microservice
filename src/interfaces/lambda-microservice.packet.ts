import { ReadPacket, WritePacket } from '@nestjs/microservices'
import { PacketId } from '@nestjs/microservices'
import {
  Context,
  SNSMessage,
  SQSRecord,
  S3EventRecord,
  EventBridgeEvent,
  APIGatewayEvent,
  APIGatewayProxyEventV2,
} from 'aws-lambda'

import { IncomingResponseError } from '../errors'

export interface ContextAware {
  context: Context
}

/* CUSTOM */
export type OutgoingCustomRequest = ReadPacket & PacketId & ContextAware
export type IncomingCustomRequest = ReadPacket & PacketId & ContextAware
export type OutgoingCustomResponse = WritePacket & PacketId
export type IncomingCustomResponse = WritePacket & PacketId

/* SQS */
export type OutgoingSqsRequest = ReadPacket<SQSRecord> & PacketId & ContextAware
export type IncomingSqsRequest = ReadPacket<SQSRecord> & PacketId & ContextAware
export type OutgoingSqsResponse = WritePacket<void> & PacketId
export type IncomingSqsResponse = WritePacket<void> & PacketId

/* SNS */
export type OutgoingSnsRequest = ReadPacket<SNSMessage> & PacketId & ContextAware
export type IncomingSnsRequest = ReadPacket<SNSMessage> & PacketId & ContextAware
export type OutgoingSnsResponse = WritePacket<void> & PacketId
export type IncomingSnsResponse = WritePacket<void> & PacketId

/* S3 */
export type OutgoingS3Request = ReadPacket<S3EventRecord> & PacketId & ContextAware
export type IncomingS3Request = ReadPacket<S3EventRecord> & PacketId & ContextAware
export type OutgoingS3Response = WritePacket<void> & PacketId
export type IncomingS3Response = WritePacket<void> & PacketId

/* EventBridge */
export type OutgoingEventBridgeRequest = ReadPacket<EventBridgeEvent<string, unknown>> & PacketId & ContextAware
export type IncomingEventBridgeRequest = ReadPacket<EventBridgeEvent<string, unknown>> & PacketId & ContextAware
export type OutgoingEventBridgeResponse = WritePacket<void> & PacketId
export type IncomingEventBridgeResponse = WritePacket<void> & PacketId

/* ApiGateway */
export type OutgoingApiGatewayRequest = ReadPacket<APIGatewayEvent | APIGatewayProxyEventV2> & PacketId & ContextAware
export type IncomingApiGatewayRequest = ReadPacket<APIGatewayEvent | APIGatewayProxyEventV2> & PacketId & ContextAware
export type OutgoingApiGatewayResponse = WritePacket<void> & PacketId
export type IncomingApiGatewayResponse = WritePacket<void> & PacketId

export type OutgoingRequest = OutgoingCustomRequest | OutgoingSqsRequest | OutgoingSnsRequest
export type IncomingRequest = IncomingCustomRequest | IncomingSqsRequest | IncomingSnsRequest
export type OutgoingResponse = OutgoingCustomResponse | OutgoingSqsResponse | OutgoingSnsResponse
export type IncomingResponse = IncomingCustomResponse | IncomingSqsResponse | IncomingSnsResponse

export type ResponseTuple = [OutgoingRequest, unknown | IncomingResponseError]
