<template>
    <n-message-provider>
        <router-view/>
    </n-message-provider>
</template>

<script>
import {defineComponent} from 'vue';
import {NMessageProvider} from 'naive-ui';

export default defineComponent({
    components: {NMessageProvider},
    setup() {
    }
});
</script>

<style>
html {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

body {
    width: 100%;
    height: 100%;
    margin: 0;
}

#app {
    width: 100%;
    height: 100%;
    font-size: 14px;
}

::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-corner {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, .1);
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, .2);
}
</style>