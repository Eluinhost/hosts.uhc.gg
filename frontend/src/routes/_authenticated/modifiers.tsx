import { createFileRoute } from '@tanstack/react-router';

import { ModifiersPage } from '@/modifiers/ModifiersPage';

export const Route = createFileRoute('/_authenticated/modifiers')({
  component: RouteComponent,
  staticData: {
    requiredPermissions: ['hosting advisor'],
  },
});

function RouteComponent() {
  return <ModifiersPage />;
}
