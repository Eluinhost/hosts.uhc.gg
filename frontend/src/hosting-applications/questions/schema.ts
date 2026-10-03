import * as v from 'valibot';

import dayjs from '@/dayjs';
import { QuestionType } from '@/hosting-applications/QuestionType';

const quizChoiceSchema = v.object({
  id: v.number(),
  text: v.string(),
  correct: v.nullable(v.boolean()),
});

export const quizQuestionSchema = v.object({
  id: v.number(),
  prompt: v.string(),
  questionType: v.enum(QuestionType),
  choices: v.array(quizChoiceSchema),
  metadata: v.nullable(
    v.object({
      createdBy: v.string(),
      created: v.pipe(
        v.string(),
        v.transform(value => dayjs.utc(value)),
      ),
    }),
  ),
});

export type QuizQuestion = v.InferOutput<typeof quizQuestionSchema>;
