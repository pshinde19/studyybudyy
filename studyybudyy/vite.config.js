import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
   server: {
    port: 3000, // Replace 3000 with your desired port
    strictPort: true, // Optional: if true, Vite will exit if the port is already in use
  },
})
