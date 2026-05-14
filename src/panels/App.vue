<script setup lang="ts">
import { inject } from 'vue';
import { ElMessage } from 'element-plus';
import { name } from '../../package.json';
import { keyAppRoot, keyMessage } from './provide-inject';
import Bulk from './components/Bulk.vue';

const appRootDom = inject(keyAppRoot);
const message = inject(keyMessage)!;

const open = () => {
    ElMessage({
        message: 'show message',
        appendTo: appRootDom,
    });
};

function open2() {
    message({ message: 'show inject message' });
}

async function showVersion() {
    const version = await Editor.Message.request(name, 'get-version');
    message({ message: version });
}

const debounce = (fn, delay) => {
    let timer = null;
    return function () {
        let context = this;
        let args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    }
}

// 防抖处理，避免编辑器中抛出报错，参考 https://github.com/element-plus/element-plus/issues/10630#issuecomment-1491191306
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback) {
        callback = debounce(callback, 16);
        super(callback);
    }
}
</script>

<template>
    <Bulk />
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
