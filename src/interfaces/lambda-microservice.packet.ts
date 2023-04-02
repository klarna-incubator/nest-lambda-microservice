import { ReadPacket, WritePacket } from '@nestjs/microservices'
import { PacketId } from '@nestjs/microservices/interfaces/packet.interface'
import { Context, SNSMessage, SQSRecord } from 'aws-lambda'

import { IncomingResponseError } from '../errors'
import { EventBridgeCronEvent } from '../external'

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

/* EventBridge */
export type OutgoingEventBridgeRequest = ReadPacket<EventBridgeCronEvent> & PacketId & ContextAware

export type OutgoingRequest = OutgoingCustomRequest | OutgoingSqsRequest | OutgoingSnsRequest
export type IncomingRequest = IncomingCustomRequest | IncomingSqsRequest | IncomingSnsRequest
export type OutgoingResponse = OutgoingCustomResponse | OutgoingSqsResponse | OutgoingSnsResponse
export type IncomingResponse = IncomingCustomResponse | IncomingSqsResponse | IncomingSnsResponse

export type ResponseTuple = [OutgoingRequest, unknown | IncomingResponseError]
