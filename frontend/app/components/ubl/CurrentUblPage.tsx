import * as React from 'react';
import { UsernameSearcher } from './UsernameSearcher';
import { UblListing } from './UblListing';
import { getAllCurrentBans } from '../../api/index';
import { WithPermission } from '../WithPermission';
import { Button, Intent } from '@blueprintjs/core';
import { Link } from 'react-router-dom';

export const CurrentUblPage: React.SFC = () => (
  <div>
    <h1 style={{ flexGrow: 0 }}>Universal Ban List</h1>
    <div style={{ flexGrow: 0 }}>
      <UsernameSearcher />
      <WithPermission permission="moderator">
        <Link to="/ubl/create">
          <Button intent={Intent.SUCCESS} iconName="take-action">Create New Ban</Button>
        </Link>
      </WithPermission>
    </div>
    <h4 style={{ paddingTop: 30 }}>
      This is a list of all accounts currently banned, sorted by most recently created.
    </h4>
    <UblListing refetch={getAllCurrentBans} />
  </div>
);
