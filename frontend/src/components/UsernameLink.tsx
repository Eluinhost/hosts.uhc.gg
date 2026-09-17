import React from 'react';
import { Link } from 'react-router';

export type UsernameLinkProps = {
  readonly username: string;
  readonly override?: React.ReactElement;
  readonly className?: string;
};

const stopProp = (e: React.MouseEvent) => {
  e.stopPropagation();
};

export const UsernameLink: React.FunctionComponent<UsernameLinkProps> = ({ username, className, override }) => (
  <Link to={`/matches/${username}`} className={`username-link ${className || ''}`} onClick={stopProp}>
    {override || `/u/${username}`}
  </Link>
);
