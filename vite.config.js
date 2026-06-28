import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app is served from /life-of-a-token/.
// Keep dev at root so the local preview and tooling work normally.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/life-of-a-token/' : '/',
  plugins: [react()],
  server: { port: 5173 },
}))
