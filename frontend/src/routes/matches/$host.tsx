import { createFileRoute } from '@tanstack/react-router';

import { HostHistoryPage } from '@/host-history/HostHistoryPage';

export const Route = createFileRoute('/matches/$host')({
  component: RouteComponent,
});

function RouteComponent() {
  const { host } = Route.useParams();

  return <HostHistoryPage host={host} />;
}
