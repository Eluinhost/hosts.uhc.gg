import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

const formDevTools = formDevtoolsPlugin();

export function DevTools() {
  return (
    <TanStackDevtools
      plugins={[
        formDevTools,
        {
          name: 'Query',
          render: <ReactQueryDevtoolsPanel />,
        },
        {
          name: 'Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
      ]}
    />
  );
}
