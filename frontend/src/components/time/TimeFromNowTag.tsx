import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { Icon, Intent, Tag, ITagProps } from '@blueprintjs/core';

type Props = {
  readonly time: moment.Moment;
  readonly hideSuffix?: boolean;
} & ITagProps;

const stateSelector = createSelector(
  (state: ApplicationState) => state.timeSync.offset,
  offset => ({
    offset,
  }),
);

export const TimeFromNowTag: React.ComponentType<Props> = React.memo((props: Props) => {
  const { offset } = useSelector(stateSelector);
  const { time, hideSuffix } = props;

  const [currentTime, setCurrentTime] = useState(moment.utc());

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(moment.utc()), 2000);
    return () => window.clearInterval(timerId);
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
      <Icon icon="time" /> {text}
    </Tag>
  );
});
