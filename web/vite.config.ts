import type { UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import FullReload from 'vite-plugin-full-reload';

//Monaco related changes came from 
//https://github.com/vitejs/vite/discussions/1791

const config: UserConfig = {
    plugins: [
        vue(),
        FullReload('src/components/test/**/*')
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
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp'
        },
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
};

export default config;