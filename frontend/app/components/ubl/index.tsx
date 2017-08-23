import * as React from 'react';
import { UsernameSearcher } from './UsernameSearcher';
import { UblCurrentListing } from './UblCurrentListing';

export const UblPage: React.SFC = () => (
  <div>
    <h1 style={{ flexGrow: 0 }}>Universal Ban List</h1>
    <div style={{ flexGrow: 0 }}>
      <UsernameSearcher />
    </div>
    <UblCurrentListing />
  </div>
);
