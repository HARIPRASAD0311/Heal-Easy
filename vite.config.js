import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // FIX: amazon-cognito-identity-js expects Node's `global` object,
  // which Vite doesn't polyfill by default (unlike webpack/CRA). This
  // causes an "Uncaught ReferenceError: global is not defined" the
  // moment the library is imported — crashing the app before React
  // even renders, which shows up as a blank white screen.
  define: {
    global: 'globalThis',
  },
})