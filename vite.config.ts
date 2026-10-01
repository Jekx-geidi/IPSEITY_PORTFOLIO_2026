import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {handleChat} from './api/chat';
import {handleWhere} from './api/where';

// Dev only: serve the Vercel function at /api/chat so the BMO chat works under `npm run dev`.
const devChatApi = (apiKey: string | undefined): Plugin => ({
  name: 'dev-chat-api',
  configureServer(server) {
    server.middlewares.use('/api/chat', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
      let raw = '';
      for await (const chunk of req) raw += chunk;
      let body: unknown = null;
      try { body = JSON.parse(raw); } catch { /* handleChat rejects a missing body */ }
      const result = await handleChat(body, req.socket.remoteAddress ?? 'local', apiKey);
      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.body));
    });
    server.middlewares.use('/api/where', async (req, res) => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const header = (name: string) => [req.headers[name]].flat()[0];
      const ip = (req.socket.remoteAddress ?? '').replace(/^::ffff:/, '');
      let raw = '';
      for await (const chunk of req) raw += chunk;
      let body: { lat?: unknown; lon?: unknown } = {};
      try { body = JSON.parse(raw); } catch { /* no GPS in the body */ }
      const lat = Number(body.lat ?? url.searchParams.get('lat') ?? NaN);
      const lon = Number(body.lon ?? url.searchParams.get('lon') ?? NaN);
      const gps = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
      const result = await handleWhere(req.method ?? 'GET', url.searchParams.get('key'), gps, ip, header);
      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.body));
    });
  },
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // api/_github.ts and api/where.ts read these from process.env, as they do on Vercel.
  for (const name of ['GITHUB_TOKEN', 'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'LOCATION_SECRET']) {
    if (env[name]) process.env[name] ??= env[name];
  }
  return {
    plugins: [react(), tailwindcss(), devChatApi(env.OPENROUTER_API_KEY)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        // Loose images saved into the project root (source art, not served) crashed
        // the dev server with EBUSY while Windows still had them locked mid-save.
        ignored: (file: string) =>
          path.resolve(path.dirname(file)) === path.resolve(__dirname) &&
          /\.(png|jpe?g|webp|gif)$/i.test(file),
      },
    },
  };
});
