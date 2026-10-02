import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig({
  plugins: [react()],
  define: { APP_VERSION: JSON.stringify(`v${version}`) },
  base: process.env.GITHUB_PAGES === '1' ? '/tank-tactics-game/' : '/',
})
