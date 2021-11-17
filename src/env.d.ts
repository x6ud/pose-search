/// <reference types="vite/client" />

declare module '*.vue' {
    import {DefineComponent} from 'vue';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module '*.vert' {
    const content: string;
    export default content;
}

declare module '*.frag' {
    const content: string;
    export default content;
}

declare module '*.obj' {
    const content: string;
    export default content;
}

declare module '*.sql' {
    const content: string;
    export default content;
}