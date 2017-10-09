import { ApplicationError } from '../ApplicationError';

export class ApiError extends ApplicationError {}
export class NotAuthenticatedError extends ApiError {}
export class NotFoundError extends ApiError {}
export class ForbiddenError extends ApiError {}
export class UnexpectedResponseError extends ApiError {
  public readonly code: number;

  constructor(code: number) {
    super();
    this.code = code;
  }
}
export class BadDataError extends ApiError {}
