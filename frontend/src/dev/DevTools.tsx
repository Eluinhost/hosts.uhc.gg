import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const formDevTools = formDevtoolsPlugin();

export function DevTools() {
  return (
    <>
      <ReactQueryDevtools />
      <TanStackDevtools plugins={[formDevTools]} />
    </>
  );
}
