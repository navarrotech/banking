// Copyright © 2024 Navarrotech

import { defineConfig } from 'vite'

// Node.js
import path from 'path'

// Plugins
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths' // https://www.npmjs.com/package/vite-tsconfig-paths
import svgr from "vite-plugin-svgr"; // https://www.npmjs.com/package/vite-plugin-svgr

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Absolute imports:
    tsconfigPaths(),
    // Preact language + JSX:
    react(),
    // Svgs:
    svgr(),
  ],
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `
          @use '@/sass/theme.sass' as *
          @use 'sass:color'
        `,
      },
      scss: {
        additionalData: `
          @use '@/sass/theme.sass' as *;
          @use 'sass:color';
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
})
