import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FTCscout2026/', // Replace with your exact GitHub repository name
})