import * as React from 'react';
import { Link } from 'react-router-dom';

export type UsernameLinkProps = {
  readonly username: string;
  readonly className?: string;
};

const stopProp = (e: React.MouseEvent<any>) => e.stopPropagation();

export const UsernameLink: React.SFC<UsernameLinkProps> = ({ username, className }) => (
  <Link to={`/hosts/${username}`} className={className || ''} onClick={stopProp}>
    /u/{username}
  </Link>
);
