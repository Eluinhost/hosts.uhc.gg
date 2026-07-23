export type HostApplicationStatus = 'pending' | 'approved' | 'declined';

export type HostApplication = {
  readonly id: number;
  readonly username: string;
  readonly created: string;
  readonly status: HostApplicationStatus;
  readonly reviewedBy: string | null;
  readonly reviewedAt: string | null;
  readonly reviewReason: string | null;
};

export type HostApplicationAnswer = {
  readonly questionPrompt: string;
  readonly questionType: 'multiple choice' | 'text';
  readonly choiceText: string | null;
  readonly choiceCorrect: boolean | null;
  readonly textAnswer: string | null;
};

export type HostApplicationDetails = HostApplication & {
  readonly answers: HostApplicationAnswer[];
};

export type SubmitAnswerData = {
  readonly questionId: number;
  readonly choiceId?: number;
  readonly textAnswer?: string;
};