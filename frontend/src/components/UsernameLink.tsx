import React from 'react';
import { Link } from 'react-router';

export type UsernameLinkProps = {
  readonly username: string;
  readonly override?: React.ReactElement;
};

const stopProp = (e: React.MouseEvent) => {
  e.stopPropagation();
};

export const UsernameLink: React.FunctionComponent<UsernameLinkProps> = ({ username, override }) => (
  <Link to={`/matches/${username}`} onClick={stopProp}>
    {override || `/u/${username}`}
  </Link>
);
