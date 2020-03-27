import * as React from 'react';
import { UsernameSearcher } from './UsernameSearcher';
import { UblListing } from './UblListing';
import { UBLApi } from '../../api';
import { WithPermission } from '../WithPermission';
import { Button, H1, H4, Intent } from "@blueprintjs/core";
import { Link } from 'react-router-dom';
import { Title } from '../Title';

export const CurrentUblPage: React.SFC = () => (
  <div>
    <Title>Current UBL</Title>
    <H1 style={{ flexGrow: 0 }}>Universal Ban List</H1>
    <div style={{ flexGrow: 0 }}>
      <UsernameSearcher />
      <WithPermission permission="ubl moderator">
        <Link to="/ubl/create">
          <Button intent={Intent.SUCCESS} icon="take-action">
            Create New Ban
          </Button>
        </Link>
      </WithPermission>
    </div>
    <H4 style={{ paddingTop: 30 }}>
      This is a list of all accounts currently banned, sorted by most recently created.
    </H4>
    <UblListing refetch={UBLApi.fetchAllCurrentBans} />
  </div>
);
