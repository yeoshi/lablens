import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), crx({ manifest })],
    define: {
      __AWS_REGION__: JSON.stringify(env.AWS_REGION || 'ap-southeast-1'),
      __AWS_ACCESS_KEY_ID__: JSON.stringify(env.AWS_ACCESS_KEY_ID || ''),
      __AWS_SECRET_ACCESS_KEY__: JSON.stringify(env.AWS_SECRET_ACCESS_KEY || ''),
      __DEMO_MODE__: JSON.stringify(env.DEMO_MODE === 'true'),
    },
    build: {
      rollupOptions: {
        input: {
          sidepanel: 'src/sidepanel/index.html',
          popup: 'src/popup/index.html',
        },
      },
    },
  };
});
