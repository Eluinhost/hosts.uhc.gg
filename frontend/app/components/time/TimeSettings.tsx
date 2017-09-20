import * as React from 'react';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { connect } from 'react-redux';
import { SettingsActions } from '../../state/SettingsState';
import { Popover2 } from '@blueprintjs/labs';
import * as moment from 'moment-timezone';
import { Button, MenuItem } from '@blueprintjs/core';
import { contains, toLower, filter, always } from 'ramda';
import { List, ListRowProps } from 'react-virtualized';
import { getTimezone, is12hFormat } from '../../state/Selectors';
import { CurrentTime } from './CurrentTime';

const tzs = moment.tz.names();

type TimezoneItemProps = {
  readonly timezone: string;
  readonly onSelect: (timezone: string) => void;
};

class TimezoneItem extends React.PureComponent<TimezoneItemProps> {
  private onSelect = () => this.props.onSelect(this.props.timezone);

  public render() {
    return (
      <MenuItem
        key={this.props.timezone}
        text={this.props.timezone}
        onClick={this.onSelect}
      />
    );
  }
}

type StateProps = {
  readonly is12h: boolean;
  readonly timezone: string;
};

type DispatchProps = {
  readonly toggleTimeFormat: () => void;
  readonly changeTimezone: (timezone: string) => void;
};

type State = {
  readonly filter: string;
};

class TimeSettingsComponent extends React.PureComponent<StateProps & DispatchProps, State> {
  state = {
    filter: '',
  };

  private searchFilter = (query: string): ((item: string) => boolean) => {
    if (!query) {
      return always(true);
    }

    const loweredQuery = toLower(query);

    return (item: string) => contains(loweredQuery, toLower(item));
  }

  private onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ filter: event.target.value })

  private onSelect = (timezone: string): void => this.props.changeTimezone(timezone);

  private noRows = () => <MenuItem text="No items found." />;

  public render() {
    const filtered = filter(this.searchFilter(this.state.filter), tzs);

    const renderRow = (props: ListRowProps) => (
      <div style={props.style} key={props.key}>
        <TimezoneItem timezone={filtered[props.index]} onSelect={this.onSelect} />
      </div>
    );

    const rowHeight = 30;
    const allRowsHeight = Math.min(490, (filtered.length * rowHeight));
    const renderedHeight = Math.max(rowHeight, allRowsHeight); // keep space for at least 1 row even if 0 length
    const height = renderedHeight + 10; // 10px padding

    return (
      <div className="pt-button-group pt-minimal" style={{ position: 'relative' }}>
        <Button>
          <h4>
            <CurrentTime prefix="Current Time: " />
          </h4>
        </Button>
        <Button
          text={this.props.is12h ? '12h' : '24h'}
          iconName="time"
          onClick={this.props.toggleTimeFormat}
        />
        <Popover2
          canEscapeKeyClose
          inheritDarkTheme
          lazy
          minimal
          inline
          placement="top-start"
          modifiers={{ inner: { enabled: true } }}
        >
          <Button
            text={this.props.timezone}
            rightIconName="double-caret-vertical"
          />
          <div>
            <input
              autoFocus
              type="text"
              className="pt-input pt-fill"
              value={this.state.filter}
              onChange={this.onFilterChange}
            />
            <List
              className="pt-menu"
              height={height}
              width={300}
              rowCount={filtered.length}
              rowHeight={rowHeight}
              rowRenderer={renderRow}
              noRowsRenderer={this.noRows}
            />
          </div>
        </Popover2>
      </div>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string, boolean, StateProps>(
  getTimezone,
  is12hFormat,
  (timezone, is12h) => ({
    timezone,
    is12h,
  }),
);

export const TimeSettings: React.ComponentClass = connect<StateProps, DispatchProps, {}>(
  stateSelector,
  (dispatch): DispatchProps => ({
    toggleTimeFormat: () => dispatch(SettingsActions.toggle12hFormat()),
    changeTimezone: (timezone: string) => dispatch(SettingsActions.setTimezone(timezone)),
  }),
)(TimeSettingsComponent);
