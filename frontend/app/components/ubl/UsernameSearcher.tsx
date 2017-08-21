import { ISelectItemRendererProps, Select } from '@blueprintjs/labs';
import * as React from 'react';
import { Button, MenuItem, Classes } from '@blueprintjs/core';
import { Redirect } from 'react-router';
import { searchBannedUsernames } from '../../api/index';
import { toPairs, map, Obj, pipe, mapObjIndexed, concat, values, flatten } from 'ramda';

type UsernameEntry = {
  readonly username: string;
  readonly uuid: string;
};

const UsernameEntrySelect: new () => Select<UsernameEntry> = Select.ofType<UsernameEntry>();

type State = {
  readonly loading: boolean;
  readonly items: UsernameEntry[];
  readonly selected: string | null;
};

export class UsernameSearcher extends React.Component<{}, State> {
  state = {
    loading: false,
    items: [],
    selected: null,
  };

  debounceId: number | null;

  noResults = () => {
    if (this.state.loading)
      return <MenuItem disabled text="Loading...." />;
    else
      return <MenuItem disabled text="No results." />;
  }

  renderItem = ({ handleClick, isActive, item }: ISelectItemRendererProps<UsernameEntry>) => {
    return (
      <MenuItem
        className={isActive ? Classes.ACTIVE : ''}
        label={item.uuid}
        key={item.username + ' | ' + item.uuid}
        onClick={handleClick}
        text={item.username}
      />
    );
  }

  onItemSelect = (item: UsernameEntry | undefined) => {
    if (item) {
      this.setState({
        selected: item.uuid,
      });
    }
  }

  convertEntryInMap = (uuids: string[], username: string) => map<string, UsernameEntry>(uuid => ({
    username,
    uuid,
  }), uuids)

  convertToFlatList = (data: Obj<string[]>): UsernameEntry[] => pipe(
    mapObjIndexed(this.convertEntryInMap),
    values,
    flatten,
  )(data)

  onChange = (value: string) => {
    if (value.trim() === '') {
      this.setState({
        loading: false,
      });

      return;
    }

    searchBannedUsernames(value)
      .then(this.convertToFlatList)
      .then(items => this.setState({
        items,
        loading: false,
      }))
      .catch(err => this.setState({
        loading: false, // TODO errors
      }));
  }

  debouncedChange = (e: React.FormEvent<HTMLInputElement>) => {
    if (this.debounceId !== null)
      clearTimeout(this.debounceId);

    this.setState({
      loading: true,
    });

    const v = e.currentTarget.value;
    this.debounceId = setTimeout(() => this.onChange(v), 300);
  }

  render() {
    if (this.state.selected)
      return <Redirect to={`/ubl/${this.state.selected}`} />;

    return (
      <UsernameEntrySelect
        items={this.state.items}
        noResults={this.noResults()}
        itemRenderer={this.renderItem}
        onItemSelect={this.onItemSelect}
        inputProps={{ onChange: this.debouncedChange }}
        popoverProps={{ popoverClassName: Classes.MINIMAL }}
      >
        <Button
          rightIconName="caret-down"
          text="Search by username"
        />
      </UsernameEntrySelect>
    );
  }
}
