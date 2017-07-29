import { DataShape, FormErrors } from 'redux-form';
import { mapObjIndexed } from 'ramda';
import { ReactElement } from 'react';

export type ValidationResult = ReactElement<any> | string | { _error?: string } | undefined;

export type Spec<T> = {
  [P in keyof T]: (prop: T[P], obj: T) => ValidationResult;
};

export const validate = <T extends DataShape>(spec: Spec<T>) => <V extends T>(obj: V): FormErrors<T> =>
  mapObjIndexed(
    (specFn: any, k: string, o: T) => specFn(obj[k], obj),
  )(spec) as any as FormErrors<T>;

