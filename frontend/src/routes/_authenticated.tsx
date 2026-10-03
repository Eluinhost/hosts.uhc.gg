import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';

import { isLoggedInAtom, permissionsAtom } from '@/authentication/atoms/authentication';
import { NotAllowed, PromptToApplyForHost, PromptToLogin } from '@/authentication/components/PermissionPrompts';

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
});

function RouteComponent() {
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const permissions = useAtomValue(permissionsAtom);

  const {
    staticData: { requiredPermissions },
  } = Route.useMatch();

  if (!isLoggedIn) {
    return <PromptToLogin />;
  }

  const hasAccess =
    !requiredPermissions ||
    requiredPermissions.length === 0 ||
    requiredPermissions.some(permission => permissions?.includes(permission));

  if (hasAccess) {
    return <Outlet />;
  }

  // separate message specifically if getting host permission would allow it
  if (requiredPermissions.some(permission => ['host', 'trial host'].includes(permission))) {
    return <PromptToApplyForHost />;
  }

  return <NotAllowed />;
}
