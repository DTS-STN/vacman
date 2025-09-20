import type { Config } from '@react-router/dev/config';

export default {
  future: {
    // see: https://reactrouter.com/how-to/middleware
    v8_middleware: true,
  },
  serverBuildFile: 'app.js',
} satisfies Config;
