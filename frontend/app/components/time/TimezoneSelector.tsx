import * as React from 'react';
import { createSelector } from 'reselect';
import { ApplicationState } from '../../state/ApplicationState';
import { connect } from 'react-redux';
import { SettingsActions } from '../../state/SettingsState';
import { Popover2 } from '@blueprintjs/labs';
import * as moment from 'moment-timezone';
import { Button, MenuItem } from '@blueprintjs/core';
import { contains, toLower, filter } from 'ramda';
import { List, ListRowProps } from 'react-virtualized';

type StateProps = {
  readonly timezone: string;
};

type DispatchProps = {
  readonly change: (timezone: string) => void;
};

const searchPredicate = (query: string, items: string[]): string[] => {
  if (!query || query.length < 2) {
    return [];
  }

  const term = toLower(query);

  return filter(
    item => contains(term, toLower(item)),
    items,
  );
};

const tzs = moment.tz.names();

type TimezoneItemProps = {
  readonly index: number;
  readonly onSelect: (index: number) => void;
};

class TimezoneItem extends React.PureComponent<TimezoneItemProps> {
  private onSelect = () => this.props.onSelect(this.props.index);

  public render() {
    return (
      <MenuItem
        className=""
        key={this.props.index}
        text={tzs[this.props.index]}
        onClick={this.onSelect}
      />
    );
  }
}

class TimezoneSelectorComponent extends React.PureComponent<StateProps & DispatchProps> {
  private onSelect = (index: number): void => this.props.change(tzs[index]);

  private renderRow = (props: ListRowProps) => (
    <div style={props.style} key={props.key}>
      <TimezoneItem index={props.index} onSelect={this.onSelect} />
    </div>
  )

  public render() {
    return (
      <Popover2
        autoFocus
        canEscapeKeyClose
        inheritDarkTheme
        lazy
        minimal
        placement="bottom-start"

      >
        <Button text={this.props.timezone} rightIconName="double-caret-vertical" />
        <div>
          <List
            className="pt-menu"
            height={500}
            width={300}
            rowCount={tzs.length}
            rowHeight={30}
            rowRenderer={this.renderRow}
          />
        </div>
      </Popover2>
    );
  }
}

const stateSelector = createSelector<ApplicationState, string, StateProps>(
  state => state.settings.timezone,
  timezone => ({
    timezone,
  }),
);

export const TimezoneSelector: React.ComponentClass = connect<StateProps, DispatchProps, {}>(
  stateSelector,
  dispatch => ({
    change: (timezone: string) => dispatch(SettingsActions.setTimezone(timezone)),
  }),
)(TimezoneSelectorComponent);
