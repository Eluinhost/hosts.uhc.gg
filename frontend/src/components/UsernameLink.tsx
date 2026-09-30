import { Link } from '@tanstack/react-router';
import React from 'react';

export type UsernameLinkProps = {
  readonly username: string;
  readonly override?: React.ReactElement;
};

const stopProp = (e: React.MouseEvent) => {
  e.stopPropagation();
};

export const UsernameLink: React.FunctionComponent<UsernameLinkProps> = ({ username, override }) => (
  <Link to="/matches/$host" params={{ host: username }} onClick={stopProp}>
    {override || `/u/${username}`}
  </Link>
);
