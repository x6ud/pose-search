import vue from '@vitejs/plugin-vue';
import {defineConfig} from 'vite';
import string from 'vite-plugin-string';
import fileServer from './vite-plugins/file-server';

export default defineConfig({
    base: './',
    plugins: [
        vue(),
        string({
            include: [
                '**/*.vert',
                '**/*.frag',
                '**/*.obj',
            ],
            compress: false,
        }),
        fileServer('/file', '/public'),
    ],
    build: {
        sourcemap: true,
        commonjsOptions: {
            transformMixedEsModules: true
        }
    }
});
