import { createFileRoute } from '@tanstack/react-router';

import { MatchDetailsPage } from '@/matches/pages/MatchDetailsPage';

export const Route = createFileRoute('/m/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <MatchDetailsPage id={Number(id)} />;
}
