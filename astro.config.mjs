// @ts-check
import { defineConfig } from 'astro/config'

/** Static marketing site for Cloudflare Pages (direct upload of dist/). */
export default defineConfig({
  site: 'https://wcgw.fun',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  server: {
    port: 3369,
    host: true,
  },
  vite: {
    server: {
      allowedHosts: ['wcgw.local.dev', 'wcgw.fun.localhost'],
    },
  },
})
