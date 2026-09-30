import { createFileRoute } from '@tanstack/react-router';

import { HostApplicationsPage } from '@/hosting-applications/HostApplicationsPage';

export const Route = createFileRoute('/host-applications/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <HostApplicationsPage />;
}
