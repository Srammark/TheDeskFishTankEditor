<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">🏺 装饰物属性：{{ decorationName }}{{ currentPart !== undefined ? ` - ${currentPart.name}` : '' }}</span>

        <div class="wC_HSVS editArea">
            <div v-if="currentPart === undefined" class="wR_HCVC placeholder">
                <span class="sumiStudio_font_body-large" style="color: var(--sumiStudioCore-color-surface-on-20);">请在左侧树形菜单中选择一个子部件</span>
            </div>
            <div v-else class="wC_HSVS editContent">
                <div class="wR_HC tabBar">
                    <div v-for="tab in tabList" :key="tab.key" class="tab" :class="{ active: currentTab === tab.key }" @click="OnSwitchTab(tab.key)">
                        {{ tab.label }}
                    </div>
                </div>

                <DecorationTabBasic v-if="currentTab === 'basic'" :part="currentPart" @update="OnUpdatePart" />
                <DecorationTabSprite v-if="currentTab === 'sprite'" :data="props.data" :decoration-name="props.decorationName" :part="currentPart" @update="OnUpdatePart" />
                <DecorationAnimationPanel v-if="currentTab === 'animation'" :data="props.data" :decoration-name="props.decorationName" :part="currentPart" :current-frame-index="currentFrameIndex" @update="OnAnimationUpdate" @select-frame="OnSelectFrame" />
                <DecorationTabCollider v-if="currentTab === 'collider'" :data="props.data" :decoration-name="props.decorationName" :part="currentPart" :current-frame-index="currentFrameIndex" :editor-texture="editorTexture" :animation-transform="currentAnimationTransform" :viewport="shapeViewport" @update="OnUpdatePart" @select-frame="OnSelectFrame" />
                <DecorationTabArea v-if="currentTab === 'area'" :data="props.data" :decoration-name="props.decorationName" :part="currentPart" :current-frame-index="currentFrameIndex" :editor-texture="editorTexture" :animation-transform="currentAnimationTransform" :viewport="shapeViewport" @update="OnUpdatePart" @select-frame="OnSelectFrame" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef } from 'vue';
import DecorationAnimationPanel from './DecorationAnimationPanel.vue';
import DecorationTabBasic from './DecorationTabBasic.vue';
import DecorationTabSprite from './DecorationTabSprite.vue';
import DecorationTabCollider from './DecorationTabCollider.vue';
import DecorationTabArea from './DecorationTabArea.vue';
import type { IShapeEditorViewport } from '../../Common/Component/ShapeEditor.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';

import {
    EMDecorationAnimationMode,
    ComputeDecorationAnimationTransform,
    type IDecorationItem, type IDecorationPart, type IDecorationTweenAnimation
} from '../../Types';
import { Texture, TextureSource, Rectangle } from 'pixi.js';

const props = defineProps<{
    data: IResourcePackageData;
    decorationName: string;
    partID?: string;
}>();

const currentTab = ref<'basic' | 'sprite' | 'animation' | 'collider' | 'area'>('basic');
const currentPartID = ref<string | undefined>(props.partID);
const currentFrameIndex = ref<number>(0);
const spriteTextureCache = new Map<string | Uint8Array, Texture>();
const currentSpriteTexture = shallowRef<Texture | null>(null);

const tabList = [
    { key: 'basic' as const, label: '基础' },
    { key: 'sprite' as const, label: '精灵图' },
    { key: 'animation' as const, label: '动画' },
    { key: 'collider' as const, label: '碰撞体' },
    { key: 'area' as const, label: '区域' }
];

const item = computed<IDecorationItem | undefined>(() => props.data.GetDecorationItem(props.decorationName));

const currentPart = computed<IDecorationPart | undefined>(() =>
{
    if (currentPartID.value === undefined) return undefined;
    return item.value?.partList.find(p => p.id === currentPartID.value);
});

const currentSpriteData = computed<Uint8Array | null | undefined>(() =>
{
    if (currentPart.value === undefined) return undefined;
    return props.data.GetDecorationSpriteSheet(props.decorationName, currentPart.value.id);
});

async function UpdateSpriteTexture(): Promise<void>
{
    const data = currentSpriteData.value;
    if (data === null || data === undefined)
    {
        currentSpriteTexture.value = null;
        return;
    }

    const cached = spriteTextureCache.get(data);
    if (cached !== undefined)
    {
        currentSpriteTexture.value = cached;
        return;
    }

    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);
    const texture = new Texture({ source: TextureSource.from(bitmap) });
    spriteTextureCache.set(data, texture);
    currentSpriteTexture.value = texture;
}

watch(() => currentSpriteData.value, () =>
{
    UpdateSpriteTexture().catch(() => { });
}, { immediate: true });

/** 碰撞体/区域编辑器使用的纹理：帧动画模式下只显示当前帧 */
const editorTexture = computed<Texture | null>(() =>
{
    const fullTexture = currentSpriteTexture.value;
    if (fullTexture === null) return null;
    if (currentPart.value?.animationMode === EMDecorationAnimationMode.Frame)
    {
        const [fw, fh] = currentPart.value?.frameAnimation?.frameSize ?? [64, 64];
        const idx = currentFrameIndex.value;
        return new Texture({ source: fullTexture.source, frame: new Rectangle(idx * fw, 0, fw, fh) });
    }
    return fullTexture;
});

const currentAnimationTransform = computed(() =>
{
    if (currentPart.value === undefined) return null;
    return ComputeDecorationAnimationTransform(currentPart.value.tweenAnimation, 0);
});

const shapeViewport = computed<IShapeEditorViewport>(() => ({
    width: 360,
    height: 360,
    originX: 180,
    originY: 180,
    scale: currentSpriteTexture.value === null
        ? 1
        : Math.min(1, 320 / Math.max(1, editorTexture.value?.width ?? 1), 320 / Math.max(1, editorTexture.value?.height ?? 1))
}));

watch(() => props.partID, (v) =>
{
    currentPartID.value = v;
});

watch(() => currentPart.value?.id, () =>
{
    // 切换子部件时无需额外操作
});

function OnSwitchTab(tab: 'basic' | 'sprite' | 'animation' | 'collider' | 'area'): void
{
    currentTab.value = tab;
}

function OnUpdatePart(): void
{
    if (currentPart.value === undefined) return;
    props.data.SetDecorationPart(props.decorationName, currentPart.value.id, JSON.parse(JSON.stringify(currentPart.value)) as IDecorationPart);
}

function OnAnimationUpdate(patch: Partial<IDecorationPart>): void
{
    if (currentPart.value === undefined) return;
    const updated = { ...currentPart.value, ...patch } as IDecorationPart;
    props.data.SetDecorationPart(props.decorationName, currentPart.value.id, updated);
}

function OnSelectFrame(index: number): void
{
    currentFrameIndex.value = index;
}
</script>
<style scoped>
.panel {
    padding: 16px 24px;
    flex: 1;
    overflow: hidden;
    gap: 16px;
    box-sizing: border-box;
}

.panelTitle {
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
}

.editArea {
    flex: 1;
    overflow: hidden;
}

.editContent {
    flex: 1;
    overflow: hidden;
}

.placeholder {
    flex: 1;
}

.tabBar {
    gap: 4px;
    flex-shrink: 0;
}

.tab {
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    background: var(--sumiStudioCore-color-surface-container);
    color: var(--sumiStudioCore-color-surface-on);
}

.tab.active {
    background: var(--sumiStudioCore-color-primary-container);
    color: var(--sumiStudioCore-color-primary-container-on);
}
</style>
