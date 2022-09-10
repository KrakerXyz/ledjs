
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import FullReload from 'vite-plugin-full-reload';

export default defineConfig({
    plugins: [
        vue(),
        FullReload('/src/components/animations/editor/*'),
        {
            name: 'configure-server',
            configureServer: server => {
                server.middlewares.use((req, res, next) => {
                    if (req.originalUrl.startsWith('/user/')) {
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
            '@/': '/src/'
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