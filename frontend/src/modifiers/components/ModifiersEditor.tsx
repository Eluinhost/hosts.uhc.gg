import { Button, EmptyState, List, Loader, Stack } from '@mantine/core';
import { WarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { ModifiersData } from '@/modifiers/api';
import { CreateModifierForm } from '@/modifiers/components/CreateModifierForm';
import { ModifierEditorRow } from '@/modifiers/components/ModifiersEditorRow';

export const ModifiersEditor: React.FC = () => {
  const { data, isFetching, error, refetch } = useQuery(ModifiersData.getAllModifiers);

  if (isFetching) {
    return <Loader />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<WarningIcon />}
        title="Failed to lookup modifiers"
        description={
          <Button
            color="red"
            onClick={() => {
              void refetch();
            }}
          >
            Try Again
          </Button>
        }
      />
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Stack>
      <List listStyleType="none" spacing="xs">
        {data.map(modifier => (
          <List.Item key={modifier.id}>
            <ModifierEditorRow modifier={modifier} />
          </List.Item>
        ))}
      </List>
      <CreateModifierForm existing={data.map(x => x.displayName.toLowerCase())} />
    </Stack>
  );
};
