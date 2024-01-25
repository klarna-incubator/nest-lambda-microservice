export class NoConsumerError extends Error {
  constructor() {
    super('No consumer is currently connected to the broker. The messages emitted by the client will be lost.')
  }
}
