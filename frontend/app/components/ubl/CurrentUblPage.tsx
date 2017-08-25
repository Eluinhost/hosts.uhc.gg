import * as React from 'react';
import { UsernameSearcher } from './UsernameSearcher';
import { UblListing } from './UblListing';
import { getAllCurrentBans } from '../../api/index';

export const CurrentUblPage: React.SFC = () => (
  <div>
    <h1 style={{ flexGrow: 0 }}>Universal Ban List</h1>
    <div style={{ flexGrow: 0 }}>
      <UsernameSearcher />
    </div>
    <UblListing refetch={getAllCurrentBans} />
  </div>
);
