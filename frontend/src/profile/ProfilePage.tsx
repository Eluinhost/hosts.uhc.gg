import { Button, EmptyState, Loader, Stack, Card, Title, Group, TextInput } from '@mantine/core';
import { WarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';

import { ApiKeysData } from '../apiKeys/api';
import { useResetStorage } from '../atoms/useResetStorage';

const ApiKeys = () => {
  const { data: apiKey, error, isFetching, refetch: refreshApiKey } = useQuery(ApiKeysData.apiKey);
  const { mutate: regenerateApiKey, isPending: isRegenerating } = ApiKeysData.mutations.useRegenerateApiKey();

  let content: ReactNode = null;
  let showActions = false;

  if (isFetching || isRegenerating) {
    content = <EmptyState icon={<Loader />} title="Loading..." />;
  } else if (error) {
    content = (
      <EmptyState
        icon={<WarningIcon />}
        title="Error"
        description={
          <Button
            onClick={() => {
              void refreshApiKey();
            }}
          >
            Click here to reload
          </Button>
        }
      />
    );
  } else {
    showActions = true;
    content = (
      <TextInput
        label="Current API Key"
        flex={1}
        readOnly
        value={apiKey?.key ?? 'No API key, click regenerate below to create one'}
      />
    );
  }

  return (
    <Card padding="lg" withBorder>
      <Stack align="s">
        <Group justify="center">
          <Title order={1}>API Keys</Title>
        </Group>
        <Group justify="center">{content}</Group>
        {showActions && (
          <Group>
            <Button
              flex={1}
              color="green"
              onClick={() => {
                void refreshApiKey();
              }}
            >
              Refresh
            </Button>
            <Button
              flex={1}
              onClick={() => {
                regenerateApiKey();
              }}
            >
              {apiKey?.key ? 'Regenerate' : 'Generate'}
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  );
};

export const ProfilePage: React.FC = () => {
  const resetStorage = useResetStorage();

  return (
    <Stack>
      <title>uhc.gg | Profile</title>

      <ApiKeys />

      <Button color="red" onClick={resetStorage} title="Resets all browser data, does not include matches/api keys">
        Reset All Browser Data
      </Button>
    </Stack>
  );
};
