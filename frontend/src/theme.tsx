import { createTheme, type MantineThemeOverride, virtualColor } from '@mantine/core';

export const theme: MantineThemeOverride = createTheme({
  fontFamily: 'Share Tech, sans-serif',
  colors: {
    primary: virtualColor({
      name: 'primary',
      dark: 'red',
      light: 'blue',
    }),
  },
  primaryColor: 'primary',
});
