// vite.config.js
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  // default root is your project folder (where index.html now lives)
  // publicDir defaults to 'public'

  build: {
    // output to dist (the default)
    // outDir: 'dist',

    rollupOptions: {
      input: {
        // Tell Rollup/Vite about both entry points
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        about: fileURLToPath(new URL('./donate.html', import.meta.url)),
        watchlist: fileURLToPath(new URL('./watchlist.html', import.meta.url)),
        details: fileURLToPath(new URL('./details.html', import.meta.url))
      }
    }
  }
})
