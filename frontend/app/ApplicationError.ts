export interface ApplicationErrorConstructor {
  new (message: string): Error;
  new (): Error;
}

export const ApplicationError = function (message?: string) {
  Error.call(this, message);
  Error.captureStackTrace(this);

  this.message = message;
  this.name = this.constructor.name;
} as any as ApplicationErrorConstructor;
