import * as React from 'react';
import { Title } from '../../components/Title';
import { H1 } from '@blueprintjs/core';
import { ModifiersEditor } from './ModifiersEditor';

export class ModifiersPage extends React.PureComponent {
  render() {
    return (
      <div>
        <Title>Modifiers</Title>
        <H1>Modifiers</H1>

        <p>
          All scenarios that are allowed past overhost rules. These are also shown to hosts as simple toggle switches
          when creating a match
        </p>

        <ModifiersEditor />
      </div>
    );
  }
}
