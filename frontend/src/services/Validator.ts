import { FormErrors } from 'redux-form';
import { isString, isArray } from 'util';

type DataShape = { [key: string]: any };

export class Validator<T extends DataShape> {
  private spec = new Map<string, (value: any, obj: T) => string | undefined>();

  public required = (prop: keyof T & string, message: string = 'This field is required'): Validator<T> =>
    this.withValidation(
      prop,
      value => {
        if (!value) return true;

        if (isArray(value) && value.length === 0) return true;

        if (isString(value) && value.trim().length === 0) return true;

        return false;
      },
      message,
    );

  public withValidation = <P extends keyof T & string>(
    prop: P,
    pred: (value: T[P], obj: T) => boolean,
    message: string,
  ): Validator<T> => {
    const validationFunction = (value: T[P], obj: T) => (pred(value, obj) ? message : undefined);

    this.spec.set(prop, validationFunction);

    return this;
  };

  public withValidationFunction = <P extends keyof T & string>(
    prop: P,
    f: (value: T[P], obj: T) => string | undefined,
  ): Validator<T> => {
    this.spec.set(prop, f);

    return this;
  };

  public validate = (obj: T): FormErrors<T> => {
    const result: FormErrors<any> = {};

    // why doesn't map have reduce or map :(
    this.spec.forEach((f, key) => {
      const error: string | undefined = f(obj[key], obj);

      if (error) {
        result[key] = error;
      }
    });

    return result;
  };
}
