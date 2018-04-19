import * as React from 'react';
import { renderTeamStyle, TeamStyles } from '../../models/TeamStyles';

type Props = {
  readonly style: string;
  readonly size: number | null;
  readonly custom: string | null;
};

export class TeamStyle extends React.PureComponent<Props> {
  render() {
    const lookup = TeamStyles.find(it => it.value === this.props.style);

    return <span>{renderTeamStyle(lookup!, this.props.size, this.props.custom)}</span>;
  }
}
