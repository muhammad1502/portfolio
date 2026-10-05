import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            // Split React out so it stays cached independently of app code
            // across deploys.
            manualChunks(id: string) {
              if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            },
          },
    },
  },
}));
