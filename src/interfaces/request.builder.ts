import { OutgoingRequest } from './lambda-microservice.packet'

export interface RequestBuilder {
  build(): OutgoingRequest
}
