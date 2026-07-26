import { createAction } from 'typesafe-redux-helpers';
import { HostApplication, HostApplicationDetails, SubmitAnswerData } from '../models/HostApplication';

export const HostApplications = {
  fetch: {
    individual: {
      start: createAction('FETCH_HOSTING_APPLICATION.START', (id: number) => ({ id })),
      started: createAction('FETCH_HOSTING_APPLICATION.STARTED', (id: number) => ({ id })),
      completed: createAction('FETCH_HOSTING_APPLICATION.COMPLETED', (details: HostApplicationDetails) => ({
        details,
      })),
    },
    list: {
      start: createAction('FETCH_HOSTING_APPLICATIONS.START'),
      started: createAction('FETCH_HOSTING_APPLICATIONS.STARTED'),
      completed: createAction('FETCH_HOSTING_APPLICATIONS.COMPLETED', (payload: Array<HostApplication>) => ({
        list: payload,
      })),
    },
  },
  create: {
    start: createAction('CREATE_HOSTING_APPLICATION.START', (data: Array<SubmitAnswerData>) => ({ data })),
    started: createAction('CREATE_HOSTING_APPLICATION.STARTED', (data: Array<SubmitAnswerData>) => ({ data })),
    completed: createAction('CREATE_HOSTING_APPLICATION.COMPLETED', (data: Array<SubmitAnswerData>) => ({ data })),
    reset: createAction('CREATE_HOSTING_APPLICATION.RESET'),
  },
  respond: {
    start: createAction(
      'RESPOND_TO_HOSTING_APPLICATION.START',
      (payload: { id: number; status: 'approve' | 'decline'; rejectReason?: string, onSuccess: () => void }) => payload,
    ),
    started: createAction(
      'RESPOND_TO_HOSTING_APPLICATION.STARTED',
      (payload: { id: number; status: 'approve' | 'decline'; rejectReason?: string }) => payload,
    ),
    completed: createAction(
      'RESPOND_TO_HOSTING_APPLICATION.COMPLETED',
      (payload: { id: number; status: 'approve' | 'decline'; rejectReason?: string }) => payload,
    ),
  },
};
