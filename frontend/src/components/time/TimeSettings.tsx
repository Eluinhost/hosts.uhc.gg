import { PopoverNext, Button, MenuItem, Card, Classes } from '@blueprintjs/core';
import { ChevronRightIcon, CogIcon, DoubleCaretVerticalIcon, TimeIcon } from '@blueprintjs/icons';
import { toLower, filter as rFilter, always, includes } from 'ramda';
import React, { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { List, type ListRowProps } from 'react-virtualized';
import { createSelector } from 'reselect';

import { Settings } from '../../actions';
import { getTimezone, is12hFormat } from '../../state/Selectors';

import { CurrentTime } from './CurrentTime';

const tzs = Intl.supportedValuesOf('timeZone');

const searchFilter = (query: string): ((item: string) => boolean) => {
  if (!query) {
    return always(true);
  }

  const loweredQuery = toLower(query);

  return (item: string) => includes(loweredQuery, toLower(item));
};

type TimezoneItemProps = {
  readonly timezone: string;
  readonly onSelect: (timezone: string) => void;
};

const TimezoneItem: React.FC<TimezoneItemProps> = ({ timezone, onSelect }) => (
  <MenuItem
    key={timezone}
    text={timezone}
    onClick={() => {
      onSelect(timezone);
    }}
  />
);

const stateSelector = createSelector(getTimezone, is12hFormat, (timezone, is12h) => ({
  timezone,
  is12h,
}));

export const TimeSettings: React.FC = () => {
  const { is12h, timezone } = useSelector(stateSelector);
  const dispatch = useDispatch();

  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);

  const onFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  }, []);

  const noRows = useCallback(() => <MenuItem text="No items found." />, []);

  const toggleOpen = () => {
    setOpen(prev => !prev);
  };

  const changeTimezone = useCallback((newTimezone: string) => dispatch(Settings.setTimezone(newTimezone)), [dispatch]);

  const toggleTimeFormat = useCallback(() => dispatch(Settings.toggleIs12h()), [dispatch]);

  const onSelect = useCallback((newTimezone: string) => changeTimezone(newTimezone), [changeTimezone]);

  const filtered = useMemo(() => rFilter(searchFilter(filter), tzs), [filter]);

  const renderRow = useCallback(
    (props: ListRowProps) => (
      <div style={props.style} key={props.key}>
        <TimezoneItem timezone={filtered[props.index]} onSelect={onSelect} />
      </div>
    ),
    [filtered, onSelect],
  );

  const rowHeight = 30;
  const allRowsHeight = Math.min(490, filtered.length * rowHeight);
  const renderedHeight = Math.max(rowHeight, allRowsHeight); // keep space for at least 1 row even if 0 length
  const height = renderedHeight + 10; // 10px padding

  return (
    <Card className="time-settings">
      <Button variant="minimal" size="large" className="current-time">
        <CurrentTime />
      </Button>
      <div className="time-settings-popout">
        {open && (
          <Button
            text={is12h ? '12h' : '24h'}
            icon={<TimeIcon />}
            variant="minimal"
            size="large"
            onClick={toggleTimeFormat}
          />
        )}
        {open && (
          <PopoverNext
            canEscapeKeyClose
            inheritDarkTheme
            lazy
            placement="bottom"
            content={
              <div>
                <input
                  autoFocus
                  type="text"
                  className={`${Classes.INPUT} ${Classes.FILL}`}
                  value={filter}
                  onChange={onFilterChange}
                />
                <List
                  className={`${Classes.MENU} ${Classes.LARGE} ${Classes.MINIMAL}`}
                  height={height}
                  width={200}
                  rowCount={filtered.length}
                  rowHeight={rowHeight}
                  rowRenderer={renderRow}
                  noRowsRenderer={noRows}
                />
              </div>
            }
            renderTarget={targetProps => (
              <Button
                {...targetProps}
                variant="minimal"
                size="large"
                text={timezone}
                endIcon={<DoubleCaretVerticalIcon />}
              />
            )}
          ></PopoverNext>
        )}
        <Button
          size="large"
          variant="minimal"
          className="toggle-time-settings"
          icon={open ? <ChevronRightIcon /> : <CogIcon />}
          onClick={toggleOpen}
        />
      </div>
    </Card>
  );
};
