
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
//import FullReload from 'vite-plugin-full-reload';
import path from 'path';

export default defineConfig({
    plugins: [
        vue(),
        // The intent for this FullReload was to force a full page reload if we changed something on a monaco editor page. This was because the monaco editor would not handle hot reloads right.
        // However, when enabled, we lost any kind of reload on non-editor pages. Maybe there's a way to fix it to fallback?
        //FullReload('src/components/**/editor/*'),
        {
            name: 'configure-server',
            configureServer: server => {
                server.middlewares.use((req, res, next) => {
                    const originalUrl: string = req.originalUrl ?? '';
                    if (originalUrl.startsWith('/user/') || originalUrl.includes('worker_file')) {
                        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
                    }
                    next();
                });
            }
        }
    ],
    resolve: {
        alias: {
            '$src/': `${path.resolve(__dirname, 'src')}/`,
            '$core/': `${path.resolve(__dirname, '../core/src')}/`,
        }
    },
    build: {
    },
    server: {
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://localhost:3001',
                ws: true
            }
        }
    }
});