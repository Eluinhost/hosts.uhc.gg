import React, { PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet';

export const Title: React.FunctionComponent<PropsWithChildren> = ({ children }) => (
  <Helmet>
    <title>{children}</title>
  </Helmet>
);
