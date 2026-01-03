import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/invento-app/',   // 👈 VERY IMPORTANT
  plugins: [react()],
})
