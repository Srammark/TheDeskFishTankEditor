<template>
    <div class="collisionEditorWrap">
        <div class="wR_HC colliderTools">
            <Button text="复制到上一帧" variant="outlined" :disabled="!canCopyPrev" @click="$emit('copyToPrev')" />
            <Button text="复制到下一帧" variant="outlined" :disabled="!canCopyNext" @click="$emit('copyToNext')" />
            <Button text="应用到全部帧" variant="outlined" @click="$emit('copyToAll')" />
        </div>
        <CollisionEditor v-if="action" :texture="texture" :frame-size="frameSize" :frame-index="frameIndex" :action="action" @update:action="$emit('update:action', $event)" />
    </div>
</template>

<script setup lang="ts">
import { Texture } from 'pixi.js';
import type { IActionData } from '../../Types.ts';
import CollisionEditor from './CollisionEditor.vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';

defineProps<{
    texture: Texture | null;
    frameSize: [number, number];
    frameIndex: number;
    action: IActionData | undefined;
    canCopyPrev: boolean;
    canCopyNext: boolean;
}>();

defineEmits<{
    (e: 'update:action', data: IActionData): void;
    (e: 'copyToPrev'): void;
    (e: 'copyToNext'): void;
    (e: 'copyToAll'): void;
}>();
</script>

<style scoped>
.collisionEditorWrap {
    border-top: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    padding-top: 8px;
}

.colliderTools {
    gap: 8px;
    padding-bottom: 8px;
}
</style>
