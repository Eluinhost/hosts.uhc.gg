import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { HostingRules } from './hosting-rules';
import { Card, H4 } from '@blueprintjs/core';

export const HomePage: React.FunctionComponent<RouteComponentProps<any>> = () => (
  <div className="home-page">
    <HostingRules />

    <Link to="/host">
      <Card interactive>
        <H4>Create a match</H4>
        <p>Create a new match post</p>
      </Card>
    </Link>

    <Link to="/matches">
      <Card interactive>
        <H4>Matches</H4>
        <p>View a list of upcoming + removed matches</p>
      </Card>
    </Link>

    <Link to="/members">
      <Card interactive>
        <H4>Members</H4>
        <p>View member roles and member moderation log</p>
      </Card>
    </Link>

    {/*<Link to="/ubl">*/}
    {/*<Card interactive>*/}
    {/*<h4>Universal Ban List</h4>*/}
    {/*<p>*/}
    {/*View the universal ban list*/}
    {/*</p>*/}
    {/*</Card>*/}
    {/*</Link>*/}
  </div>
);
