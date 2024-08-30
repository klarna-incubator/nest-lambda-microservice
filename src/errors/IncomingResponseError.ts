export class IncomingResponseError extends Error {
  constructor(
    public readonly requestId: string,
    public readonly cause: unknown,
  ) {
    super(`The server failed to process the request`)

    this.message = `${this.message}, cause: ${this.trySerializeCause(cause)}`
  }

  protected trySerializeCause(cause: unknown): string {
    try {
      if (cause instanceof Error) {
        return JSON.stringify(cause, Object.getOwnPropertyNames(cause))
      }

      return JSON.stringify(cause)
    } catch (_error) {
      return `${cause}`
    }
  }
}
