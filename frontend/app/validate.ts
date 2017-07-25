import { DataShape, FormErrors } from 'redux-form';
import { mapObjIndexed } from 'ramda';
import { ReactElement } from 'react';

export type Spec<T> = {
  [P in keyof T]: (prop: T[P], obj: T) => ReactElement<any> | string | { _error?: string } | undefined;
};

export const validate = <T extends DataShape>(spec: Spec<T>) => <V extends T>(obj: V): FormErrors<T> =>
  mapObjIndexed((v, k, o) => spec[k](v, o))(obj) as any as FormErrors<T>;

