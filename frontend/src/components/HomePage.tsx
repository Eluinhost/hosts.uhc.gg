import { Card, H4 } from '@blueprintjs/core';
import React from 'react';
import { Link } from 'react-router';

import { HostingRules } from '../hosting-rules/components';

export const HomePage: React.FC = () => (
  <div className="home-page">
    <title>uhc.gg | Home</title>
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
  </div>
);
