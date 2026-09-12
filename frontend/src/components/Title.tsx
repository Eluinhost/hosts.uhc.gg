import { Helmet } from 'react-helmet';
import React from 'react';

export const Title: React.FunctionComponent = ({ children }) => (
  <Helmet>
    <title>{children}</title>
  </Helmet>
);
