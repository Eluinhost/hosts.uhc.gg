import { NonIdealState } from '@blueprintjs/core';
import * as React from 'react';

export const NoMatches: React.SFC = () => (
  <NonIdealState
    title="Nothing to see!"
    visual="geosearch"
    description="There are currently no matches in the queue"
  />
);
