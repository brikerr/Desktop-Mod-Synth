import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
  build: {
    // Ensure all processor files are emitted as separate files
    // (not inlined as data URIs) for audioWorklet.addModule()
    assetsInlineLimit: 0,
  },
})
