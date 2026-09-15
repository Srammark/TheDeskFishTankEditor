<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">🎨 装饰物精灵图资源：{{ decorationName }}</span>

        <div v-if="partList.length === 0" class="wR_HCVC placeholder">
            <span class="sumiStudio_font_body-large" style="color: var(--sumiStudioCore-color-surface-on-20);">该装饰物暂无子部件</span>
        </div>

        <div v-else class="wC_HSB spriteGrid">
            <div
                v-for="part in partList"
                :key="part.id"
                class="wC_HC spriteCard"
                @click="OnClickPart(part.id)"
            >
                <div class="spriteThumbWrap">
                    <img v-if="GetSpriteDataURL(part.id) !== null" :src="GetSpriteDataURL(part.id)!" class="spriteThumb" />
                    <span v-else class="sumiStudio_font_body-large" style="color: var(--sumiStudioCore-color-surface-on-20);">无精灵图</span>
                </div>
                <span class="spritePartName">{{ part.name }}</span>
                <span class="spritePartZ">z={{ part.zIndex }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import type { IDecorationPart } from '../../Types';

const props = defineProps<{
    data: IResourcePackageData;
    decorationName: string;
}>();

const emit = defineEmits<{
    (e: 'selectPart', partID: string): void;
}>();

const item = computed(() => props.data.GetDecorationItem(props.decorationName));
const partList = computed<IDecorationPart[]>(() =>
{
    return [...(item.value?.partList ?? [])].sort((a, b) => a.zIndex - b.zIndex);
});

const dataURLMap = new Map<string, string>();

function GetSpriteDataURL(partID: string): string | null
{
    const data = props.data.GetDecorationSpriteSheet(props.decorationName, partID);
    if (data === null || data === undefined) return null;

    const cached = dataURLMap.get(partID);
    if (cached !== undefined) return cached;

    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    dataURLMap.set(partID, url);
    return url;
}

function OnClickPart(partID: string): void
{
    emit('selectPart', partID);
}
</script>

<style scoped>
.panel {
    padding: 16px 24px;
    flex: 1;
    overflow: hidden;
    gap: 16px;
}

.panelTitle {
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
}

.placeholder {
    flex: 1;
}

.spriteGrid {
    flex: 1;
    overflow-y: auto;
    gap: 16px;
}

.spriteCard {
    width: 140px;
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
    background: var(--sumiStudioCore-color-surface-container);
    color: var(--sumiStudioCore-color-surface-on);
}

.spriteCard:hover {
    background: var(--sumiStudioCore-color-surface-container-highest);
}

.spriteThumbWrap {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sumiStudioCore-color-surface-container-highest);
    border-radius: 4px;
}

.spriteThumb {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.spritePartName {
    font-size: 13px;
    margin-top: 8px;
}

.spritePartZ {
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-20);
}
</style>
