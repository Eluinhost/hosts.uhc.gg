import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { H1 } from '@blueprintjs/core';
import { ShowQuizQuestions } from './ShowQuizQuestions';

export class QuizManagementPage extends React.PureComponent<RouteComponentProps<any>> {
  render() {
    return (
      <div>
        <H1>Host Application Quiz</H1>
        <div style={{ margin: 30 }}>
          <ShowQuizQuestions />
        </div>
      </div>
    );
  }
}
