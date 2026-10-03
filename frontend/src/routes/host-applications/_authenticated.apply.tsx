import { createFileRoute } from '@tanstack/react-router';

import { ApplyHostApplicationPage } from '@/hosting-applications/components/ApplyHostApplication';

export const Route = createFileRoute('/host-applications/_authenticated/apply')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ApplyHostApplicationPage />;
}
