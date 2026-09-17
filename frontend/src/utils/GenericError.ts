export class GenericError extends Error {
  constructor(
    public message: string,
    public cause: unknown,
  ) {
    const causeMessage = cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : null;

    super(`${message}${causeMessage ? `, caused by:\n ${causeMessage}` : ''}`);
  }
}
