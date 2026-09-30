import { Title } from '@mantine/core';
import React from 'react';

import { ModifiersEditor } from '@/modifiers/components/ModifiersEditor';

export const ModifiersPage: React.FC = () => (
  <div>
    <title>uhc.gg | Modifiers</title>
    <Title order={1}>Modifiers</Title>

    <p>
      All scenarios that are allowed past overhost rules. These are also shown to hosts as simple toggle switches when
      creating a match
    </p>

    <ModifiersEditor />
  </div>
);
