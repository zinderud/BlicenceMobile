import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/Image/AssetRegistry': 'react-native-web/dist/modules/AssetRegistry',
      'react-native/Libraries/Image/resolveAssetSource': 'react-native-web/dist/modules/AssetRegistry',
    },
    extensions: ['.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx'],
  },
  define: {
    global: 'globalThis',
    __DEV__: true,
  },
  optimizeDeps: {
    exclude: ['react-native'],
    include: ['react-native-web'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
});
