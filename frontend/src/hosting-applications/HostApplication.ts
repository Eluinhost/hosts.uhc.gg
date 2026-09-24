export enum HostApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
}

export type HostApplication = {
  readonly id: number;
  readonly username: string;
  readonly created: string;
  readonly status: HostApplicationStatus;
  readonly reviewedBy: string | null;
  readonly reviewedAt: string | null;
  readonly reviewReason: string | null;
};

export type SubmitAnswerData = {
  readonly questionId: number;
  readonly choiceId?: number;
  readonly textAnswer?: string;
};
