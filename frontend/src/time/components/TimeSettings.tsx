import { PopoverNext, Button, MenuItem, Card, Classes } from '@blueprintjs/core';
import { ChevronRightIcon, CogIcon, DoubleCaretVerticalIcon, TimeIcon } from '@blueprintjs/icons';
import { useAtom } from 'jotai';
import React, { useCallback, useMemo, useState } from 'react';
import { List, type RowComponentProps } from 'react-window';

import { is12hAtom } from '../../atoms/timeFormatting';
import { timezoneAtom } from '../../atoms/timezone';

import { CurrentTime } from './CurrentTime';

const tzs = Intl.supportedValuesOf('timeZone');

const searchFilter = (query: string): ((item: string) => boolean) => {
  if (!query) {
    return () => true;
  }

  const loweredQuery = query.toLowerCase();

  return (item: string) => item.toLowerCase().includes(loweredQuery);
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

type TimezoneRowProps = {
  readonly timezones: readonly string[];
  readonly onSelect: (timezone: string) => void;
};

const TimezoneRow = ({ index, style, timezones, onSelect }: RowComponentProps<TimezoneRowProps>) => (
  <div style={style}>
    <TimezoneItem timezone={timezones[index]} onSelect={onSelect} />
  </div>
);

export const TimeSettings: React.FC = () => {
  const [timezone, setTimezone] = useAtom(timezoneAtom);
  const [is12h, setIs12h] = useAtom(is12hAtom);

  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);

  const onFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  }, []);

  const toggleOpen = () => {
    setOpen(prev => !prev);
  };

  const filtered = useMemo(() => tzs.filter(searchFilter(filter)), [filter]);

  const onSelectTimezone = useCallback(
    (value: string) => {
      setTimezone(value);
    },
    [setTimezone],
  );

  const rowProps = useMemo<TimezoneRowProps>(
    () => ({ timezones: filtered, onSelect: onSelectTimezone }),
    [filtered, onSelectTimezone],
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
            onClick={() => {
              setIs12h(!is12h);
            }}
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
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  type="text"
                  className={`${Classes.INPUT} ${Classes.FILL}`}
                  value={filter}
                  onChange={onFilterChange}
                />
                {filtered.length === 0 ? (
                  <div className={`${Classes.MENU} ${Classes.LARGE} ${Classes.MINIMAL}`}>
                    <MenuItem text="No items found." />
                  </div>
                ) : (
                  <List
                    className={`${Classes.MENU} ${Classes.LARGE} ${Classes.MINIMAL}`}
                    style={{ height, width: 200 }}
                    rowCount={filtered.length}
                    rowHeight={rowHeight}
                    rowComponent={TimezoneRow}
                    rowProps={rowProps}
                  />
                )}
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
