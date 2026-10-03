import { createFileRoute } from '@tanstack/react-router';

import { ProfilePage } from '@/profile/ProfilePage';

export const Route = createFileRoute('/_authenticated/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProfilePage />;
}
