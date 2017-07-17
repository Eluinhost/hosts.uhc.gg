import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

export const HomePage: React.SFC<RouteComponentProps<any>> = () => (
  <div className="home-page">
    <h1>uhc.gg Hosting Portal</h1>

    <pre style={{ minHeight: 400 }}>
      Some rules here maybe?
    </pre>

    <Link to="/host">
      <div className="pt-card pt-interactive">
        <h4>Create a match</h4>
        <p>
          Some text about creating a match
        </p>
      </div>
    </Link>

    <Link to="/matches">
      <div className="pt-card pt-interactive">
        <h4>Matches</h4>
        <p>
          Some text about matches
        </p>
      </div>
    </Link>

    <Link to="/mod/hosts">
      <div className="pt-card pt-interactive">
        <h4>Moderate hosts</h4>
        <p>
          Some text about moderating hosts
        </p>
      </div>
    </Link>
  </div>
);
