<template>
    <div class="spriteFrameWrap" :style="{ width: width + 'px', height: height + 'px' }">
        <img v-if="imageUrl" :src="imageUrl" class="spriteFramePreview" :style="{ width: width + 'px', height: height + 'px', objectFit: 'contain', imageRendering: 'pixelated' }" />
        <div v-else class="spriteFramePreview" :style="{ width: width + 'px', height: height + 'px' }"></div>
        <span v-if="index !== undefined" class="frameIndex">{{ index }}</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    imageUrl: string | null;
    width: number;
    height: number;
    index?: number;
}>();
</script>

<style scoped>
.spriteFrameWrap {
    position: relative;
    display: block;
}
.spriteFramePreview { display: block; }
.frameIndex {
    position: absolute;
    right: 2px;
    bottom: 1px;
    font-size: 9px;
    line-height: 1;
    color: #fff;
    background: rgba(0, 0, 0, 0.55);
    padding: 1px 3px;
    border-radius: 2px;
    pointer-events: none;
}
</style>
