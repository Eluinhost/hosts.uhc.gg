import { createFileRoute } from '@tanstack/react-router';

import { MembersPage } from '@/members/MembersPage';

export const Route = createFileRoute('/members')({
  component: RouteComponent,
});

function RouteComponent() {
  return <MembersPage />;
}
