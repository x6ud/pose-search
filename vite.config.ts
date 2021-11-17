import vue from '@vitejs/plugin-vue';
import copy from 'rollup-plugin-copy';
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
                '**/*.sql',
            ],
            compress: false,
        }),
        copy({
            targets: [
                {src: 'node_modules/sql.js/dist/*', dest: 'public/assets/sql.js/'},
            ]
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
