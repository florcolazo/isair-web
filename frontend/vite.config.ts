import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        conocenos:   resolve(__dirname, 'conocenos.html'),
        contactanos: resolve(__dirname, 'contactanos.html'),
        editor:      resolve(__dirname, 'editor.html'),
        admin:       resolve(__dirname, 'admin.html'),
        superadmin:  resolve(__dirname, 'superadmin.html'),
      },
    },
  },
});

