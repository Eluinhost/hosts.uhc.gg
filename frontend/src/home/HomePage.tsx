import { Card, Stack, Title, Text } from '@mantine/core';
import React from 'react';
import { Link } from 'react-router';

import styles from '@/home/HomePage.module.css';
import { HostingRules } from '@/hosting-rules/components/HostingRules';

const HomePageLink = ({ to, title, text }: { to: string; title: string; text: string }) => (
  <Card component={Link} to={to} withBorder shadow="sm" className={styles.homePageLink}>
    <Title order={4}>{title}</Title>
    <Text>{text}</Text>
  </Card>
);

export const HomePage: React.FC = () => (
  <Stack w="100%" align="stretch">
    <title>uhc.gg | Home</title>
    <HostingRules />

    <HomePageLink to="/host" title="Create a match" text="Create a new match post" />
    <HomePageLink to="/matches" title="Matches" text="View a list of upcoming + removed matches" />
    <HomePageLink to="/members" title="Members" text="View member roles and member moderation log" />
  </Stack>
);
