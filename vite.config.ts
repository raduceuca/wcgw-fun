import { resolve } from 'path'
import { readdirSync, existsSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function discoverToolEntries(): Record<string, string> {
  const toolsDir = resolve(__dirname, 'tools')
  if (!existsSync(toolsDir)) return {}

  const entries: Record<string, string> = {}
  for (const name of readdirSync(toolsDir, { withFileTypes: true })) {
    if (!name.isDirectory()) continue
    const indexPath = resolve(toolsDir, name.name, 'index.html')
    if (existsSync(indexPath)) {
      entries[`tools/${name.name}`] = indexPath
    }
  }
  return entries
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...discoverToolEntries(),
      },
    },
  },
})
