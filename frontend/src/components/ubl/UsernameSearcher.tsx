import { IItemRendererProps, ISelectProps, Select } from '@blueprintjs/select';
import * as React from 'react';
import { Button, MenuItem, Classes } from '@blueprintjs/core';
import { Redirect } from 'react-router';
import { UBLApi } from '../../api';
import { map, mapObjIndexed, values, flatten } from 'ramda';
import { isUuid } from '../../services/isUuid';

type UsernameEntry = {
  readonly username: string;
  readonly uuid: string;
};

const UsernameEntrySelect: new (props: ISelectProps<UsernameEntry>) => Select<UsernameEntry> = Select.ofType<
  UsernameEntry
>();

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

  debounceId: number | null = null;

  noResults = () => {
    if (this.state.loading) return <MenuItem disabled text="Loading...." />;

    return <MenuItem disabled text="No results." />;
  };

  renderItem = ({ uuid, username }: UsernameEntry, { handleClick, modifiers }: IItemRendererProps) => {
    return (
      <MenuItem
        className={modifiers.active ? Classes.ACTIVE : ''}
        label={uuid}
        key={username + ' | ' + uuid}
        onClick={handleClick}
        text={username}
      />
    );
  };

  onItemSelect = (item: UsernameEntry | undefined) => {
    if (item) {
      this.setState({
        selected: item.uuid,
      });
    }
  };

  convertEntryInMap = (uuids: string[], username: string): UsernameEntry[] =>
    map<string, UsernameEntry>(
      uuid => ({
        username,
        uuid,
      }),
      uuids,
    );

  convertToFlatList = (data: { [key: string]: string[] }): UsernameEntry[] =>
    flatten(values(mapObjIndexed<string[], UsernameEntry[]>(this.convertEntryInMap, data)));

  onChange = (value: string): Promise<void> =>
    UBLApi.searchBannedUsernames(value)
      .then(this.convertToFlatList)
      .then(items =>
        this.setState({
          items,
          loading: false,
        }),
      )
      .catch(() =>
        this.setState({
          loading: false, // TODO errors
        }),
      );

  debouncedChange = (query: string) => {
    if (this.debounceId !== null) clearTimeout(this.debounceId);

    this.setState({
      loading: true,
    });

    // is a UUID, give them a single option to load it directly
    if (isUuid(query)) {
      this.setState({
        loading: false,
        items: [
          {
            uuid: query,
            username: 'Click to load UUID',
          },
        ],
      });

      return;
    }

    if (query.trim() === '') {
      this.setState({
        loading: false,
        items: [],
      });
    } else {
      this.debounceId = window.setTimeout(() => this.onChange(query), 300);
    }
  };

  render() {
    if (this.state.selected) return <Redirect to={`/ubl/${this.state.selected}`} />;

    return (
      <UsernameEntrySelect
        items={this.state.items}
        noResults={this.noResults()}
        itemRenderer={this.renderItem}
        onItemSelect={this.onItemSelect}
        onQueryChange={this.debouncedChange}
        popoverProps={{ popoverClassName: Classes.MINIMAL }}
      >
        <Button rightIcon="caret-down" text="Show full ban history for username/UUID" />
      </UsernameEntrySelect>
    );
  }
}
