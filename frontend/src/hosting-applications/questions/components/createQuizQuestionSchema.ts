import * as v from 'valibot';

import { QuestionType } from '@/hosting-applications/QuestionType';

const createQuizQuestionChoiceSchema = v.object({
  text: v.string(),
  correct: v.boolean(),
});

const promptSchema = v.pipe(v.string(), v.trim(), v.minLength(5, 'Must be a least 5 characters long'));

export const createQuizQuestionSchema = v.variant('questionType', [
  v.object({
    prompt: promptSchema,
    questionType: v.literal(QuestionType.TEXT),
    // allows array for form input but doesn't validate it and removes any entries when parsed
    choices: v.pipe(
      v.array(createQuizQuestionChoiceSchema),
      v.transform(() => []),
    ),
  }),
  v.object({
    prompt: promptSchema,
    questionType: v.literal(QuestionType.MULTIPLE_CHOICE),
    choices: v.pipe(
      v.array(
        v.object({
          ...createQuizQuestionChoiceSchema.entries,
          text: v.pipe(v.string(), v.trim(), v.nonEmpty('This field is required')),
        }),
      ),
      v.check(
        array => array.reduce((acc, item) => (item.correct ? acc + 1 : acc), 0) === 1,
        'Must have exactly 1 correct choice',
      ),
      v.checkItems((item, index, array) => array.indexOf(item) === index, 'Duplicate items are not allowed'),
      v.minLength(2, 'Must have at least 2 choices'),
    ),
  }),
]);
