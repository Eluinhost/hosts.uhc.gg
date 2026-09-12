import React from 'react';
import { H1 } from '@blueprintjs/core';
import { ShowQuizQuestions } from './ShowQuizQuestions';

export const QuizManagementPage: React.FC = () => (
  <div>
    <H1>Host Application Quiz</H1>
    <div style={{ margin: 30 }}>
      <ShowQuizQuestions />
    </div>
  </div>
);
