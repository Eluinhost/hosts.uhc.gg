import React, { useCallback, useEffect } from 'react';
import { Button, NonIdealState, Spinner } from '@blueprintjs/core';

import { SelectField, SelectFieldProps } from '../../components/fields/SelectField';
import { useDispatch, useSelector } from 'react-redux';
import { getListVersionsState } from '../selectors';
import { FETCH_VERSIONS } from '../actions';

export type MainVersionFieldProps = Omit<SelectFieldProps, 'options'>;

export const MainVersionField: React.FC<MainVersionFieldProps> = React.memo((props: MainVersionFieldProps) => {
  const { isFetching, error, data } = useSelector(getListVersionsState);
  const dispatch = useDispatch();

  const updateVersionList = useCallback(() => dispatch(FETCH_VERSIONS.TRIGGER()), [dispatch]);

  useEffect(() => {
    if (!isFetching && !error && data.length === 0) {
      updateVersionList();
    }
    // matching previous componentDidMount logic to run just once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isFetching) {
    return <Spinner />;
  }

  if (error) {
    return (
      <NonIdealState
        icon="warning-sign"
        title="Failed to load versions list"
        action={<Button onClick={updateVersionList}>Try Again</Button>}
      />
    );
  }

  const options = data.map(item => ({
    display: item,
    value: item,
  }));

  return <SelectField {...props} options={options} />;
});
