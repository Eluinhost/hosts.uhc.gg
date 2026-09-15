import { Intent, Tag, type TagProps } from '@blueprintjs/core';
import { TimeIcon } from '@blueprintjs/icons';
import moment from 'moment-timezone';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import type { ApplicationState } from '../../state/ApplicationState';

type Props = {
  readonly time: moment.Moment;
  readonly hideSuffix?: boolean;
} & TagProps;

const stateSelector = createSelector(
  (state: ApplicationState) => state.timeSync.offset,
  offset => ({
    offset,
  }),
);

export const TimeFromNowTag: React.FC<Props> = props => {
  const { offset } = useSelector(stateSelector);
  const { time, hideSuffix } = props;

  const [currentTime, setCurrentTime] = useState(moment.utc());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(moment.utc());
    }, 2000);
    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const { text, intent } = useMemo(() => {
    const now = currentTime.add(offset, 'milliseconds');
    const text = time.from(now, hideSuffix);

    let intent: Intent = Intent.SUCCESS;
    const diff = time.diff(now, 'minutes');

    if (diff < 0) {
      intent = Intent.WARNING;
    }

    if (diff < -30) {
      intent = Intent.DANGER;
    }

    return { text, intent };
  }, [time, currentTime, offset, hideSuffix]);

  return (
    <Tag {...props} intent={intent}>
      <TimeIcon /> {text}
    </Tag>
  );
};
