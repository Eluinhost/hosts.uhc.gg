import type { ReactFormType } from '@tanstack/react-form';

import { appFormOptions } from '@/forms/useAppForm';
import { createQuizQuestionSchema } from '@/hosting-applications/questions/components/createQuizQuestionSchema';
import { QuestionType } from '@/hosting-applications/QuestionType';

export const createQuestionForm = appFormOptions.strictSchema(createQuizQuestionSchema, {
  defaultValues: {
    prompt: '',
    questionType: QuestionType.MULTIPLE_CHOICE,
    choices: [
      { text: '', correct: true },
      { text: '', correct: false },
    ],
  },
  validators: [
    {
      run: createQuizQuestionSchema,
      triggers: ['change'],
    },
  ],
});

export type CreateQuestionForm = ReactFormType<typeof createQuestionForm>;
