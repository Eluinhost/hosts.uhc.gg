import { EmptyState, Loader, Stack } from '@mantine/core';

export const AuthSplash = () => (
  <Stack w="100vw" h="100vh" justify="center" align="center">
    <EmptyState icon={<Loader />} title="Loading..." />
  </Stack>
);
