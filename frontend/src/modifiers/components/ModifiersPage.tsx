import { H1 } from '@blueprintjs/core';
import React from 'react';

import { ModifiersEditor } from './ModifiersEditor';

export const ModifiersPage: React.FC = () => (
  <div>
    <title>uhc.gg | Modifiers</title>
    <H1>Modifiers</H1>

    <p>
      All scenarios that are allowed past overhost rules. These are also shown to hosts as simple toggle switches when
      creating a match
    </p>

    <ModifiersEditor />
  </div>
);
