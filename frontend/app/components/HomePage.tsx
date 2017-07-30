import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { HostingRules } from './HostingRules';

export const HomePage: React.SFC<RouteComponentProps<any>> = () => (
  <div className="home-page">
    <HostingRules />

    <Link to="/host">
      <div className="pt-card pt-interactive">
        <h4>Create a match</h4>
        <p>
          Create a new match post
        </p>
      </div>
    </Link>

    <Link to="/matches">
      <div className="pt-card pt-interactive">
        <h4>Matches</h4>
        <p>
          View a list of upcoming + removed matches
        </p>
      </div>
    </Link>

    <Link to="/members">
      <div className="pt-card pt-interactive">
        <h4>Members</h4>
        <p>
          View member roles and member moderation log
        </p>
      </div>
    </Link>
  </div>
);
