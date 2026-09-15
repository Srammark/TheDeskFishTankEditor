<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">🎨 精灵图资源</span>

        <!-- Size 切换 -->
        <div class="wR_HC sizeTabs">
            <div v-for="size in sizeNameList" :key="size" class="sizeTab" :class="{ active: currentSize === size }" @click="OnSwitchSize(size)">
                {{ size }}
            </div>
        </div>

        <div class="wR_HSVC" style="gap: 12px;">
            <Button :text="editMode === 'image' ? '转为编辑碰撞体' : '转为编辑图片'" variant="outlined" @click="OnToggleEditMode" />
            <div class="wR_HCVCB frameSizeBar">
                <span>帧尺寸</span>
                <input v-model.number="frameSizeW" type="number" min="1" class="sizeInput" @change="OnFrameSizeChange" />
                <span>×</span>
                <input v-model.number="frameSizeH" type="number" min="1" class="sizeInput" @change="OnFrameSizeChange" />
            </div>
        </div>

        <input ref="fileInputRef" type="file" accept="image/*" multiple style="display: none;" @change="OnFileSelected" />

        <!-- Actions -->
        <div class="spriteTable">
            <div v-for="actionName in actionNameList" :key="actionName" class="tableRow">
                <div class="actionHeader">
                    <span class="actionLabel">{{ ActionLabelMap[actionName] }}</span>
                    <span class="previewBtn" :class="{ active: previewAction === actionName }" @click="OnTogglePreview(actionName)">{{ previewAction === actionName ? '⏸' : '▶' }}</span>
                    <div class="fpsInputWrap">
                        <span>FPS</span>
                        <input v-model.number="fpsMap[actionName]" type="number" min="1" max="120" class="fpsInput" @change="OnFpsChange(actionName)" />
                    </div>
                </div>
                <div class="frameList">
                    <div v-for="idx in GetFrameCount(actionName)" :key="idx" class="frameBox" :class="{ 'frameBox-empty': !HasFrameImage(actionName, idx - 1), 'frameBox-selected': IsSelected(actionName, idx - 1) }" @click="OnFrameClick(actionName, idx - 1)">
                        <SpriteFramePreview v-if="HasFrameImage(actionName, idx - 1)" :image-url="GetFrameImageUrl(actionName, idx - 1)" :width="previewSize" :height="previewSize" :index="idx" />
                        <span v-else class="framePlaceholder">{{ idx }}</span>
                        <div class="deleteBtn" @click.stop="OnRemoveFrame(actionName, idx - 1)">×</div>
                    </div>
                    <div class="frameBox frameBox-add" @click="OnAddFrame(actionName)">
                        <span>+</span>
                    </div>
                </div>
            </div>
        </div>
        <SpriteCollisionPanel
            v-if="editMode === 'collision' && selectedFrame"
            :texture="GetFrameTexture(selectedFrame.action, selectedFrame.index)"
            :frame-size="GetFrameSize()"
            :frame-index="selectedFrame.index"
            :action="GetActionData(selectedFrame.action)"
            :can-copy-prev="selectedFrame.index > 0"
            :can-copy-next="selectedFrame.index < GetFrameCount(selectedFrame.action) - 1"
            @update:action="OnActionUpdate(selectedFrame.action, $event)"
            @copy-to-prev="OnCopyToPrev"
            @copy-to-next="OnCopyToNext"
            @copy-to-all="OnCopyToAll"
        />

        <!-- Animation Preview -->
        <AnimationPreview
            v-if="previewAction"
            :textures="GetActionTextures(previewAction)"
            :fps="fpsMap[previewAction]"
            :frame-data-list="GetActionFrameData(previewAction)"
            :collider="GetActionCollider(previewAction)"
        />

        <div class="tipText">
            <span>{{ editMode === 'image' ? '提示：点击格子上传帧图片' : '提示：点击格子选择要编辑碰撞体的帧' }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { Texture } from 'pixi.js';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import SpriteFramePreview from '../../Common/Component/SpriteFramePreview.vue';
import SpriteCollisionPanel from './SpriteCollisionPanel.vue';
import AnimationPreview from '../../Common/Component/AnimationPreview.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import type { TSpriteSize, TSpriteAction, TSexFolder, ISizeConfig, IFrameData, IActionData, ICreatureCollider } from '../../Types';
import * as SpriteSheetUtil from '../../SpriteSheetUtil';

const props = defineProps<{
    data: IResourcePackageData;
    speciesName: string;
    strainName: string;
    sexName: TSexFolder;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);

const currentSize = ref<TSpriteSize>('Small');
const actionNameList: TSpriteAction[] = ['idle', 'swim', 'eat'];
const sizeNameList: TSpriteSize[] = ['Small', 'Medium', 'Large'];

const ActionLabelMap: Record<TSpriteAction, string> = {
    idle: '悬浮',
    swim: '游动',
    eat: '吃食'
};

const editMode = ref<'image' | 'collision'>('image');
const selectedFrame = ref<{ action: TSpriteAction; index: number } | null>(null);
const previewAction = ref<TSpriteAction | null>(null);

const fpsMap = reactive<Record<TSpriteAction, number>>({ idle: 8, swim: 12, eat: 8 });
const frameSizeW = ref(64);
const frameSizeH = ref(64);

let sheetTexture: Texture | null = null;
const frameTextureMap = new Map<string, Texture>();
let sheetBlobUrl: string | null = null;
let sheetImg: HTMLImageElement | null = null;
const frameDataUrlMap = new Map<string, string>();
const uploadTarget = reactive<{ action: TSpriteAction | null; index: number | null }>({ action: null, index: null });

const previewSize = 48;

onMounted(() =>
{
    LoadSizeData();
});

onUnmounted(() =>
{
    CleanupTextures();
});

watch(() => [props.speciesName, props.strainName, props.sexName, currentSize.value], () =>
{
    CleanupTextures();
    LoadSizeData();
});

function CleanupTextures(): void
{
    sheetTexture?.destroy();
    sheetTexture = null;
    for (const t of frameTextureMap.values())
    {
        t.destroy();
    }
    frameTextureMap.clear();
    if (sheetBlobUrl !== null)
    {
        URL.revokeObjectURL(sheetBlobUrl);
        sheetBlobUrl = null;
    }
    sheetImg = null;
    frameDataUrlMap.clear();
}

function LoadSizeData(): void
{
    const config = props.data.GetSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
    if (config !== undefined)
    {
        frameSizeW.value = config.frameSize[0];
        frameSizeH.value = config.frameSize[1];
        for (const action of actionNameList)
        {
            fpsMap[action] = config.actionList[action].fps;
        }
    }
    else
    {
        const defaultConfig = props.data.EnsureSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
        frameSizeW.value = defaultConfig.frameSize[0];
        frameSizeH.value = defaultConfig.frameSize[1];
    }
    LoadSheetTexture();
}

async function LoadSheetTexture(): Promise<void>
{
    const sheet = props.data.GetSpriteSheet(props.speciesName, props.strainName, props.sexName, currentSize.value);
    if (sheet !== null && sheet !== undefined)
    {
        sheetTexture = await SpriteSheetUtil.LoadSpriteSheetTexture(sheet);
        const blob = new Blob([sheet.buffer as ArrayBuffer], { type: 'image/png' });
        if (sheetBlobUrl !== null) URL.revokeObjectURL(sheetBlobUrl);
        sheetBlobUrl = URL.createObjectURL(blob);
        sheetImg = new Image();
        await new Promise<void>((resolve) =>
        {
            sheetImg!.onload = () => resolve();
            sheetImg!.src = sheetBlobUrl!;
        });
        frameDataUrlMap.clear();
    }
}

function GetFrameSize(): [number, number]
{
    return [frameSizeW.value, frameSizeH.value];
}

function GetFrameCount(action: TSpriteAction): number
{
    const config = props.data.GetSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
    return config?.actionList[action].frameList.length ?? 0;
}

function GetActionData(action: TSpriteAction): IActionData | undefined
{
    const config = props.data.GetSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
    return config?.actionList[action];
}

function GetActionCollider(action: TSpriteAction): ICreatureCollider
{
    return GetActionData(action)?.collider ?? { body: null, mouth: null };
}

function HasFrameImage(action: TSpriteAction, index: number): boolean
{
    return GetFrameTexture(action, index) !== null;
}

function GetFrameTexture(action: TSpriteAction, index: number): Texture | null
{
    if (sheetTexture === null) return null;
    const key = `${action}/${index}`;
    if (frameTextureMap.has(key)) return frameTextureMap.get(key)!;

    try
    {
        const texture = SpriteSheetUtil.ExtractFrameTexture(sheetTexture, action, index, GetFrameSize());
        frameTextureMap.set(key, texture);
        return texture;
    }
    catch
    {
        return null;
    }
}

function GetFrameImageUrl(action: TSpriteAction, index: number): string | null
{
    if (sheetImg === null) return null;
    const key = `${action}/${index}`;
    if (frameDataUrlMap.has(key)) return frameDataUrlMap.get(key)!;
    const canvas = document.createElement('canvas');
    const [fw, fh] = GetFrameSize();
    canvas.width = fw;
    canvas.height = fh;
    const ctx = canvas.getContext('2d')!;
    const row = ActionRowMap[action];
    ctx.drawImage(sheetImg, index * fw, row * fh, fw, fh, 0, 0, fw, fh);
    const dataUrl = canvas.toDataURL('image/png');
    frameDataUrlMap.set(key, dataUrl);
    return dataUrl;
}

const ActionRowMap: Record<TSpriteAction, number> = { idle: 0, swim: 1, eat: 2 };

function GetActionTextures(action: TSpriteAction): Texture[]
{
    const count = GetFrameCount(action);
    const list: Texture[] = [];
    for (let i = 0; i < count; i++)
    {
        const t = GetFrameTexture(action, i);
        if (t !== null) list.push(t);
    }
    return list;
}

function GetActionFrameData(action: TSpriteAction): IFrameData[]
{
    const config = props.data.GetSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
    return config?.actionList[action].frameList ?? [];
}

function IsSelected(action: TSpriteAction, index: number): boolean
{
    return selectedFrame.value?.action === action && selectedFrame.value?.index === index;
}

function OnSwitchSize(size: TSpriteSize): void
{
    currentSize.value = size;
    selectedFrame.value = null;
    previewAction.value = null;
}

function OnFrameClick(action: TSpriteAction, index: number): void
{
    if (editMode.value === 'collision')
    {
        selectedFrame.value = { action, index };
        return;
    }
    uploadTarget.action = action;
    uploadTarget.index = index;
    fileInputRef.value?.click();
}

function OnAddFrame(action: TSpriteAction): void
{
    props.data.AddFrame(props.speciesName, props.strainName, props.sexName, currentSize.value, action);
}

async function OnRemoveFrame(action: TSpriteAction, index: number): Promise<void>
{
    props.data.RemoveFrame(props.speciesName, props.strainName, props.sexName, currentSize.value, action, index);
    await RebuildSpriteSheet();
}

async function OnFrameSizeChange(): Promise<void>
{
    const config = props.data.EnsureSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
    config.frameSize = [Math.max(1, frameSizeW.value), Math.max(1, frameSizeH.value)];
    await RebuildSpriteSheet();
}

function OnFpsChange(action: TSpriteAction): void
{
    const config = props.data.EnsureSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
    config.actionList[action].fps = Math.max(1, Math.min(120, fpsMap[action]));
}

function OnToggleEditMode(): void
{
    editMode.value = editMode.value === 'image' ? 'collision' : 'image';
    selectedFrame.value = null;
}

function OnTogglePreview(action: TSpriteAction): void
{
    previewAction.value = previewAction.value === action ? null : action;
}

function OnActionUpdate(action: TSpriteAction, data: IActionData): void
{
    const config = props.data.EnsureSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
    config.actionList[action] = data;
    props.data.SetSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value, config);
}

function OnCopyToPrev(): void
{
    if (selectedFrame.value === null) return;
    props.data.CopyColliderToAdjacentFrame(props.speciesName, props.strainName, props.sexName, currentSize.value, selectedFrame.value.action, selectedFrame.value.index, -1);
}

function OnCopyToNext(): void
{
    if (selectedFrame.value === null) return;
    props.data.CopyColliderToAdjacentFrame(props.speciesName, props.strainName, props.sexName, currentSize.value, selectedFrame.value.action, selectedFrame.value.index, 1);
}

function OnCopyToAll(): void
{
    if (selectedFrame.value === null) return;
    props.data.CopyColliderToAllFrames(props.speciesName, props.strainName, props.sexName, currentSize.value, selectedFrame.value.action, selectedFrame.value.index);
}

async function OnFileSelected(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files === null || files.length === 0) return;

    if (uploadTarget.action !== null && uploadTarget.index !== null)
    {
        const file = files[0];
        const buffer = new Uint8Array(await file.arrayBuffer());
        await SetFrameImage(uploadTarget.action, uploadTarget.index, buffer);
    }
    else if (uploadTarget.action !== null && uploadTarget.index === null)
    {
        // Batch import for action
        const sorted = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
        for (let i = 0; i < sorted.length; i++)
        {
            const file = sorted[i];
            const buffer = new Uint8Array(await file.arrayBuffer());
            const config = props.data.EnsureSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
            while (config.actionList[uploadTarget.action].frameList.length <= i)
            {
                props.data.AddFrame(props.speciesName, props.strainName, props.sexName, currentSize.value, uploadTarget.action);
            }
            await SetFrameImage(uploadTarget.action, i, buffer);
        }
    }

    input.value = '';
    CleanupTextures();
    await LoadSheetTexture();
}

async function SetFrameImage(action: TSpriteAction, index: number, imageData: Uint8Array): Promise<void>
{
    const config = props.data.EnsureSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
    const sheet = props.data.GetSpriteSheet(props.speciesName, props.strainName, props.sexName, currentSize.value);
    const frames = await GetCurrentFrames(sheet, config);
    frames[action][index] = imageData;
    const newSheet = await SpriteSheetUtil.BuildSpriteSheet(frames, config.frameSize);
    props.data.SetSpriteSheet(props.speciesName, props.strainName, props.sexName, currentSize.value, newSheet);

    const collider = await SpriteSheetUtil.GenerateDefaultCollider(imageData, config.frameSize);
    const actionData = config.actionList[action];
    if (collider !== null && actionData.collider.body === null)
    {
        // 上传首帧图片时按图像轮廓生成身体碰撞体
        actionData.collider.body = collider;
    }
    actionData.frameList[index] = actionData.frameList[index] ?? { colliderOverride: {} };
}

async function GetCurrentFrames(sheet: Uint8Array | null | undefined, config: ISizeConfig): Promise<Record<TSpriteAction, (Uint8Array | null)[]>>
{
    if (sheet === null || sheet === undefined)
    {
        return { idle: [], swim: [], eat: [] };
    }
    const counts: Record<TSpriteAction, number> = {
        idle: config.actionList.idle.frameList.length,
        swim: config.actionList.swim.frameList.length,
        eat: config.actionList.eat.frameList.length
    };
    return SpriteSheetUtil.ParseSpriteSheet(sheet, config.frameSize, counts);
}

async function RebuildSpriteSheet(): Promise<void>
{
    const config = props.data.EnsureSizeConfig(props.speciesName, props.strainName, props.sexName, currentSize.value);
    const sheet = props.data.GetSpriteSheet(props.speciesName, props.strainName, props.sexName, currentSize.value);
    const frames = await GetCurrentFrames(sheet, config);
    const newSheet = await SpriteSheetUtil.BuildSpriteSheet(frames, config.frameSize);
    props.data.SetSpriteSheet(props.speciesName, props.strainName, props.sexName, currentSize.value, newSheet);
    CleanupTextures();
    await LoadSheetTexture();
}
</script>

<style scoped>
.panel {
    padding: 16px 24px;
    flex: 1;
    overflow-y: auto;
    gap: 16px;
}

.panelTitle {
    color: var(--sumiStudioCore-color-surface-on);
}

.sizeTabs {
    gap: 8px;
    padding: 8px 0;
}

.sizeTab {
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    background: var(--sumiStudioCore-color-surface-container);
    color: var(--sumiStudioCore-color-surface-on);
    font-size: var(--sumiStudio-font-body-medium-size);
}

.sizeTab.active {
    background: var(--sumiStudioCore-color-primary);
    color: var(--sumiStudioCore-color-primary-on);
}

.frameSizeBar {
    gap: 8px;
    padding: 4px 0;
    font-size: var(--sumiStudio-font-body-small-size);
    color: var(--sumiStudioCore-color-surface-on);
}

.sizeInput {
    width: 56px;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    color: var(--sumiStudioCore-color-surface-on);
}

.spriteTable {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tableRow {
    display: flex;
    gap: 8px;
    align-items: flex-start;
}

.actionHeader {
    width: 80px;
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
}

.actionLabel {
    font-size: var(--sumiStudio-font-body-medium-size);
    color: var(--sumiStudioCore-color-surface-on);
    opacity: 0.6;
}

.previewBtn {
    font-size: 12px;
    color: #fff;
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.15s;
}

.previewBtn:hover,
.previewBtn.active {
    opacity: 1;
    color: var(--sumiStudioCore-color-primary);
}

.fpsInputWrap {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on);
    opacity: 0.5;
}

.fpsInput {
    width: 40px;
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    color: var(--sumiStudioCore-color-surface-on);
}

.frameList {
    flex: 1;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    padding: 8px;
    background: var(--sumiStudioCore-color-primary-container);
    border-radius: 4px;
    min-height: 64px;
}

.frameBox {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--sumiStudioCore-color-surface);
    transition: border-color 0.15s;
    position: relative;
}

.frameBox:hover {
    border-color: var(--sumiStudioCore-color-primary);
}

.frameBox-empty {
    background-color: var(--sumiStudioCore-color-surface-container-highest);
    opacity: 0.2;
}

.frameBox-selected {
    border-color: var(--sumiStudioCore-color-primary);
    box-shadow: 0 0 0 2px var(--sumiStudioCore-color-primary);
}

.framePlaceholder {
    font-size: 10px;
    color: var(--sumiStudioCore-color-surface-on);
}

.deleteBtn {
    position: absolute;
    top: 0;
    right: 0;
    width: 14px;
    height: 14px;
    line-height: 14px;
    text-align: center;
    font-size: 10px;
    background: rgba(255, 0, 0, 0.6);
    color: #fff;
    border-radius: 0 0 0 4px;
    display: none;
}

.frameBox:hover .deleteBtn {
    display: block;
}

.frameBox-add {
    border-style: dashed;
    opacity: 0.5;
}

.tipText {
    font-size: var(--sumiStudio-font-body-small-size);
    color: var(--sumiStudioCore-color-surface-on-20);
}
</style>
