import { createFileRoute } from '@tanstack/react-router';

import { QuizManagementPage } from '@/hosting-applications/questions/QuizManagementPage';

export const Route = createFileRoute('/_authenticated/quiz')({
  component: RouteComponent,
  staticData: {
    requiredPermissions: ['hosting advisor'],
  },
});

function RouteComponent() {
  return <QuizManagementPage />;
}
