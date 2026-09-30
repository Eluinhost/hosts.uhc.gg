import { createFileRoute } from '@tanstack/react-router';

import { LoginPage } from '@/login/LoginPage';

interface LoginSearchParams {
  path: string | null;
  token: string | null;
  refresh: string | null;
}

const getParam = (param: unknown): string | null => {
  if (typeof param !== 'string') {
    return null;
  }

  return param;
};

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): LoginSearchParams => {
    return {
      path: getParam(search.path),
      token: getParam(search.token),
      refresh: getParam(search.refresh),
    };
  },
});

function RouteComponent() {
  const { path, refresh, token } = Route.useSearch();

  return <LoginPage path={path} refreshToken={refresh} accessToken={token} />;
}
