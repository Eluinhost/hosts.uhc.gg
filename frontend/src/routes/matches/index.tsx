import { createFileRoute } from '@tanstack/react-router';

import { UpcomingMatchesPage } from '@/matches/pages/UpcomingMatchesPage';

export const Route = createFileRoute('/matches/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <UpcomingMatchesPage />;
}
