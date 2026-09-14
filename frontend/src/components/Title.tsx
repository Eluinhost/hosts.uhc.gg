import { Helmet } from 'react-helmet';
import React, { PropsWithChildren } from 'react';

export const Title: React.FunctionComponent<PropsWithChildren> = ({ children }) => (
  <Helmet>
    <title>{children}</title>
  </Helmet>
);
