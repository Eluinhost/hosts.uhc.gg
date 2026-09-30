import { Card, Title, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import styles from '@/home/HomePageLink.module.css';

export const HomePageLink = ({ to, title, text }: { to: string; title: string; text: string }) => (
  <Card component={Link} to={to} withBorder shadow="sm" className={styles.homePageLink}>
    <Title order={4}>{title}</Title>
    <Text>{text}</Text>
  </Card>
);
