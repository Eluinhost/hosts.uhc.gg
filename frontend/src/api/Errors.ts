import { ApplicationError } from '../models/ApplicationError';

export class ApiError extends ApplicationError {}
export class NotAuthenticatedError extends ApiError {
  constructor() {
    super('User is not authenticated');
  }
}
export class NotFoundError extends ApiError {
  constructor() {
    super('Resource not found');
  }
}
export class ForbiddenError extends ApiError {
  constructor() {
    super('User is not allowed to perform this action');
  }
}
export class UnexpectedResponseError extends ApiError {
  constructor(public readonly code: number) {
    super('Unexpected response from API');
  }
}
export class BadDataError extends ApiError {
  constructor(response: string) {
    super(`User supplied invalid data: ${response}`);
  }
}
