<template>
    <div class="wC_HSVS tabContent">
        <input ref="spriteInputRef" type="file" accept="image/*" style="display: none;" @change="OnSpriteSelected" />
        <div class="wR_HC spriteActions">
            <Button text="上传精灵图" variant="outlined" @click="OnClickUpload" />
            <Button v-if="part.sprite !== undefined" text="删除" variant="outlined" @click="OnRemove" />
        </div>
        <div class="spritePreviewWrap">
            <img v-if="spriteDataURL !== null" :src="spriteDataURL" class="spritePreview" />
            <span v-else class="sumiStudio_font_body-large" style="color: var(--sumiStudioCore-color-surface-on-20);">尚未上传精灵图</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import type { IDecorationPart } from '../../Types';

const props = defineProps<{
    data: IResourcePackageData;
    decorationName: string;
    part: IDecorationPart;
}>();

const emit = defineEmits<{
    (e: 'update'): void;
}>();

const spriteInputRef = ref<HTMLInputElement | null>(null);

const spriteData = computed<Uint8Array | null | undefined>(() => props.data.GetDecorationSpriteSheet(props.decorationName, props.part.id));

const spriteDataURL = computed<string | null>(() =>
{
    const data = spriteData.value;
    if (data === null || data === undefined) return null;
    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/png' });
    return URL.createObjectURL(blob);
});

function OnClickUpload(): void
{
    spriteInputRef.value?.click();
}

async function OnSpriteSelected(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file === undefined) return;

    const buffer = new Uint8Array(await file.arrayBuffer());
    props.data.SetDecorationSpriteSheet(props.decorationName, props.part.id, buffer);

    props.part.sprite = `${props.part.id}.png`;
    emit('update');
    input.value = '';
}

function OnRemove(): void
{
    props.data.SetDecorationSpriteSheet(props.decorationName, props.part.id, null);
    props.part.sprite = undefined;
    emit('update');
}
</script>

<style scoped>
.tabContent {
    flex: 1;
    overflow-y: auto;
    gap: 12px;
    padding-top: 8px;
}

.spriteActions {
    gap: 8px;
}

.spritePreviewWrap {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sumiStudioCore-color-surface-container-highest);
    border-radius: 4px;
}

.spritePreview {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>
