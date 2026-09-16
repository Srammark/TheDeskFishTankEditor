<template>
    <div class="collisionEditorWrap">
        <div class="wR_HC colliderTools">
            <Button :text="T('page.manageResourcePackage.sprite.copyToPrev')" variant="outlined" :disabled="!canCopyPrev" @click="$emit('copyToPrev')" />
            <Button :text="T('page.manageResourcePackage.sprite.copyToNext')" variant="outlined" :disabled="!canCopyNext" @click="$emit('copyToNext')" />
            <Button :text="T('page.manageResourcePackage.sprite.copyToAll')" variant="outlined" @click="$emit('copyToAll')" />
        </div>
        <CollisionEditor v-if="action" :texture="texture" :frame-size="frameSize" :frame-index="frameIndex" :action="action" @update:action="$emit('update:action', $event)" />
    </div>
</template>

<script setup lang="ts">
import { Texture } from 'pixi.js';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import type { IActionData } from '../../Types.ts';
import CollisionEditor from './CollisionEditor.vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);

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
