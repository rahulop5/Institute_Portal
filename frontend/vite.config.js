import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // This frontend is abandoned - feedback_frontend is the real, deployed
  // one (see ROADMAP.md Round 3). Pinned off the default 5173 so this can
  // never accidentally grab the port feedback_frontend (and the backend's
  // CORS allowlist) expect, if this dev server is ever started by mistake.
  server: {
    port: 5199,
    strictPort: true,
  },
})
