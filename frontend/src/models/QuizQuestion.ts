export type QuestionType = 'multiple choice' | 'text';

export type QuizChoice = {
  readonly id: number;
  readonly text: string;
};

export type QuizQuestion = {
  readonly id: number;
  readonly prompt: string;
  readonly questionType: QuestionType;
  readonly choices: QuizChoice[];
};

export type ManageQuizChoice = QuizChoice & {
  readonly correct: boolean;
};

export type ManageQuizQuestion = {
  readonly id: number;
  readonly prompt: string;
  readonly questionType: QuestionType;
  readonly createdBy: string;
  readonly created: string;
  readonly choices: ManageQuizChoice[];
};

export type CreateQuizChoiceData = {
  readonly text: string;
  readonly correct: boolean;
};

export type CreateQuizQuestionData = {
  readonly prompt: string;
  readonly questionType: QuestionType;
  readonly choices: CreateQuizChoiceData[];
};
