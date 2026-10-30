import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base './' lets the same build run from GitHub Pages (/repo-name/) or locally.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: "Pan Pan's Adventure",
        short_name: 'Pan Pan',
        description: 'Learning games for little explorers',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#bfe9ff',
        theme_color: '#7cc8f0',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        maximumFileSizeToCacheInBytes: 5_000_000,
      },
    }),
  ],
});
