import { H1 } from '@blueprintjs/core';
import React from 'react';

import { ShowQuizQuestions } from './components/ShowQuizQuestions';

export const QuizManagementPage: React.FC = () => (
  <div>
    <title>uhc.gg | Host Application Quiz</title>
    <H1>Host Application Quiz</H1>
    <div style={{ margin: 30 }}>
      <ShowQuizQuestions />
    </div>
  </div>
);
