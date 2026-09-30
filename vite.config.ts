import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {handleChat} from './api/chat';

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
  },
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // api/_github.ts reads this from process.env, as it does on Vercel.
  if (env.GITHUB_TOKEN) process.env.GITHUB_TOKEN ??= env.GITHUB_TOKEN;
  return {
    plugins: [react(), tailwindcss(), devChatApi(env.OPENROUTER_API_KEY)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
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
