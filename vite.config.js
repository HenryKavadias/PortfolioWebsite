import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const base = process.env.NODE_ENV === 'production' ? '/PortfolioWebsite/' : '/';

export default defineConfig({
  plugins: [react()],
  base,
  define: {
    __APP_BASE__: JSON.stringify(base)
  }
})
