import { FormErrors } from 'redux-form';

type DataShape = { [key: string]: unknown };

export class Validator<T extends DataShape> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private spec = new Map<string, (value: any, obj: T) => string | undefined>();

  public required = (prop: keyof T & string, message: string = 'This field is required'): this =>
    this.withValidation(
      prop,
      value => {
        if (!value) return true;

        if (Array.isArray(value) && value.length === 0) return true;

        if (typeof value === 'string' && value.trim().length === 0) return true;

        return false;
      },
      message,
    );

  public withValidation = <P extends keyof T & string>(
    prop: P,
    pred: (value: T[P], obj: T) => boolean,
    message: string,
  ): this => {
    const validationFunction = (value: T[P], obj: T) => (pred(value, obj) ? message : undefined);

    this.spec.set(prop, validationFunction);

    return this;
  };

  public withValidationFunction = <P extends keyof T & string>(
    prop: P,
    f: (value: T[P], obj: T) => string | undefined,
  ): this => {
    this.spec.set(prop, f);

    return this;
  };

  public validate = (obj: T): FormErrors<T> => {
    const result: FormErrors<T> = {};

    // why doesn't map have reduce or map :(
    this.spec.forEach((f, key) => {
      const error: string | undefined = f(obj[key], obj);

      if (error) {
        // going to remove this validator later, just bypass error for now
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        result[key] = error;
      }
    });

    return result;
  };
}
