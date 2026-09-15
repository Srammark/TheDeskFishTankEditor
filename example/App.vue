<template>
    <div style="width: 100%; height: 100%;">
        <TheDeskFishTankEditor></TheDeskFishTankEditor>
    </div>
</template>
<script setup lang="ts">
import { TheDeskFishTankEditor } from '../src/index';

</script>
<style>
[v-cloak] {
    display: none !important
}

html,
pre {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0)
}

html {
    width: 100%;
    height: 100%;
}

body {
    margin: 0;
    width: 100%;
    height: 100%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0)
}

p {
    margin: 0;
    padding: 0
}

a {
    color: #333;
    background-color: transparent;
    -webkit-text-decoration-skip: objects;
    -webkit-tap-highlight-color: transparent;
    text-decoration: none
}

a:active,
a:hover,
a:focus {
    text-decoration: none;
    outline-width: 0
}

input,
textarea {
    border: 0
}

input:focus,
textarea:focus {
    outline: none !important;
    border: 0
}

textarea {
    outline: 0;
    resize: none
}
</style>
