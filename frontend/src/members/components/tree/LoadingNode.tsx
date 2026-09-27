import { Skeleton, List } from '@mantine/core';

export const LoadingNode = () => {
  return <Skeleton w="100%" h={30} aria-label="Loading" component={List.Item} mt={4} />;
};
