import * as v from 'valibot';

export const createHostApplicationSchema = v.object({
  answers: v.array(
    v.object({
      questionId: v.number(),
      answer: v.pipe(v.string(), v.nonEmpty('This field is required')),
    }),
  ),
});

export type CreateHostApplicationSchema = v.InferInput<typeof createHostApplicationSchema>;
