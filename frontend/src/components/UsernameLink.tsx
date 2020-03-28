import * as React from 'react';
import { Link } from 'react-router-dom';

export type UsernameLinkProps = {
  readonly username: string;
  readonly override?: React.ReactElement<any>;
  readonly className?: string;
};

const stopProp = (e: React.MouseEvent<any>) => e.stopPropagation();

export const UsernameLink: React.FunctionComponent<UsernameLinkProps> = ({ username, className, override }) => (
  <Link to={`/matches/${username}`} className={`username-link ${className || ''}`} onClick={stopProp}>
    {override || `/u/${username}`}
  </Link>
);
