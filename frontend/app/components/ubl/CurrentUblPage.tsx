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
    <UblListing refetch={getAllCurrentBans} />
  </div>
);
