import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DevTools as JotaiDevTools } from 'jotai-devtools';

import 'jotai-devtools/styles.css';

const formDevTools = formDevtoolsPlugin();

export function DevTools() {
  return (
    <>
      <ReactQueryDevtools />
      <TanStackDevtools plugins={[formDevTools]} />
      <JotaiDevTools />
    </>
  );
}
