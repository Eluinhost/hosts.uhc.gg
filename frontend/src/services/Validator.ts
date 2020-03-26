import { DataShape, FormErrors } from 'redux-form';
import { ReactElement } from 'react';
import { isString, isArray } from 'util';

export type ValidationResult = ReactElement | string | { _error?: string } | undefined;

type SpecFn<T extends DataShape, P extends keyof T> = (value: T[P], obj: T) => ValidationResult;

export class Validator<T extends DataShape> {
  private spec = new Map<keyof T, SpecFn<T, keyof T>>();

  public required = (prop: keyof T, message: string = 'This field is required'): Validator<T> =>
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

  public withValidation = <P extends keyof T>(
    prop: P,
    pred: (value: T[P], obj: T) => boolean,
    result: ValidationResult,
  ): Validator<T> => {
    const validationFunction: SpecFn<T, P> = (value: T[P], obj: T) => (pred(value, obj) ? result : undefined);

    this.spec.set(prop, validationFunction as SpecFn<T, keyof T>);

    return this;
  };

  public withValidationFunction = <P extends keyof T>(
    prop: P,
    f: (value: T[P], obj: T) => ValidationResult,
  ): Validator<T> => {
    this.spec.set(prop, f as SpecFn<T, keyof T>);

    return this;
  };

  public validate = (obj: T): FormErrors<T> => {
    const result: FormErrors<T> = {};

    // why doesn't map have reduce or map :(
    this.spec.forEach((f: SpecFn<T, keyof T>, key: keyof T) => {
      result[key] = f(obj[key], obj);
    });

    return result;
  };
}
