import { createFileRoute } from '@tanstack/react-router';

import { HostingPage } from '@/host/HostingPage';

export const Route = createFileRoute('/_authenticated/host')({
  component: RouteComponent,
});

function RouteComponent() {
  return <HostingPage />;
}
