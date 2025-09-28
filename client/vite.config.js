import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const serverHost = process.env.VITE_SERVER_HOST || 'localhost';
const serverPort = Number(process.env.VITE_SERVER_PORT || 4000);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || 5173),
    proxy: {
      '/socket.io': {
        target: `http://${serverHost}:${serverPort}`,
        ws: true
      }
    }
  }
});
