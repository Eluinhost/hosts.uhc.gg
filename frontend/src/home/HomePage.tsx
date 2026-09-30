import { Stack } from '@mantine/core';
import React from 'react';

import { HomePageLink } from '@/home/HomePageLink';
import { HostingRules } from '@/hosting-rules/components/HostingRules';

export const HomePage: React.FC = () => (
  <Stack w="100%" align="stretch">
    <title>uhc.gg | Home</title>
    <HostingRules />

    <HomePageLink to="/host" title="Create a match" text="Create a new match post" />
    <HomePageLink to="/matches" title="Matches" text="View a list of upcoming + removed matches" />
    <HomePageLink to="/members" title="Members" text="View member roles and member moderation log" />
  </Stack>
);
