<template>
    <div class="collisionEditor">
        <div class="wR_HC editorArea">
            <ShapeEditor v-show="currentSlot === 'body'" :texture="texture" :viewport="viewport" :shape="bodyShape" :color="bodyColor" @update:shape="OnBodyShapeUpdate" />
            <ShapeEditor v-show="currentSlot === 'mouth'" :texture="texture" :viewport="viewport" :shape="mouthShape" :color="mouthColor" @update:shape="OnMouthShapeUpdate" />
        </div>
        <div class="propPanel">
            <div class="wR_HC tabBar">
                <div class="tab" :class="{ active: currentSlot === 'body' }" @click="OnSwitchSlot('body')">身体</div>
                <div class="tab" :class="{ active: currentSlot === 'mouth' }" @click="OnSwitchSlot('mouth')">嘴部</div>
            </div>
            <div class="wR_HC toolRow">
                <span v-if="HasSlotOverride(currentSlot)" class="overrideTag" title="该帧形状已被覆盖，点击重置为基础形状" @click="OnResetOverride(currentSlot)">已覆盖 ×</span>
                <Button v-if="localData.collider[currentSlot] === null" text="创建形状" variant="outlined" @click="OnCreateCollider" />
                <Button v-else-if="frameIndex === 0" text="删除形状" variant="outlined" @click="OnDeleteCollider" />
            </div>
            <div class="wR_HC toolRow" style="gap: 8px;">
                <Button text="复制形状" variant="outlined" :disabled="GetEffectiveShape(currentSlot) === null" @click="OnCopyShape" />
                <Button text="粘贴形状" variant="outlined" :disabled="colliderClipboard === null" @click="OnPasteShape" />
                <span v-if="colliderClipboard !== null" class="frameTip">已复制：{{ ShapeTypeName(colliderClipboard) }}</span>
            </div>
            <span v-if="frameIndex === 0" class="frameTip">第 1 帧编辑的是基础形状（所有帧共用）</span>
        </div>
    </div>
</template>

<script lang="ts">
import { shallowRef } from 'vue';
import type { IColliderData as IColliderDataClipboard } from '../../Types.ts';

/** 模块级形状剪贴板：跨动作、跨组件实例共享，用于把形状粘贴到其他动作 */
const colliderClipboardShared = shallowRef<IColliderDataClipboard | null>(null);
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Texture } from 'pixi.js';
import { EMGeometryType } from '@/Core/Module/Collision2D_DLL/Geometry/GeometryType';
import type { IActionData, IFrameData, TColliderSlot, IColliderData } from '../../Types.ts';
import ShapeEditor, { type IShapeEditorViewport } from '../../Common/Component/ShapeEditor.vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';

const props = defineProps<{
    texture: Texture | null;
    frameSize: [number, number];
    frameIndex: number;
    action: IActionData;
}>();

const emit = defineEmits<{
    (e: 'update:action', data: IActionData): void;
}>();

const currentSlot = ref<TColliderSlot>('body');
const localData = ref<IActionData>(JSON.parse(JSON.stringify(props.action)) as IActionData);

watch(() => props.action, (v) =>
{
    localData.value = JSON.parse(JSON.stringify(v)) as IActionData;
});

const viewport = computed<IShapeEditorViewport>(() =>
{
    const [fw, fh] = props.frameSize;
    const maxDim = Math.max(fw, fh);
    const canvasSize = 360;
    const scale = maxDim > 0 ? canvasSize / maxDim : 1;
    return {
        width: canvasSize,
        height: canvasSize,
        originX: canvasSize / 2,
        originY: canvasSize / 2,
        scale
    };
});

const bodyColor = 0x00aaff;
const mouthColor = 0xff4444;

const bodyShape = computed<IColliderData | null>(() => GetEffectiveShape('body'));
const mouthShape = computed<IColliderData | null>(() => GetEffectiveShape('mouth'));

const colliderClipboard = colliderClipboardShared;

const ShapeTypeNameMap: Record<number, string> = {
    [EMGeometryType.Circle]: '圆形',
    [EMGeometryType.Rectangle]: '矩形',
    [EMGeometryType.Polygon]: '多边形',
    [EMGeometryType.Capsule]: '胶囊',
    [EMGeometryType.Ellipse]: '椭圆',
    [EMGeometryType.Pie]: '扇形',
    [EMGeometryType.Segment]: '线段'
};

function ShapeTypeName(shape: IColliderData): string
{
    return ShapeTypeNameMap[shape.type] ?? '形状';
}

function GetFrameData(): IFrameData | undefined
{
    return localData.value.frameList[props.frameIndex];
}

function GetEffectiveShape(slot: TColliderSlot): IColliderData | null
{
    if (props.frameIndex > 0)
    {
        const override = GetFrameData()?.colliderOverride[slot];
        if (override !== undefined) return override;
    }
    return localData.value.collider[slot];
}

function HasSlotOverride(slot: TColliderSlot): boolean
{
    if (props.frameIndex === 0) return false;
    return GetFrameData()?.colliderOverride[slot] !== undefined;
}

function IsColliderEqual(a: IColliderData | null, b: IColliderData | null): boolean
{
    if (a === null || b === null) return a === b;
    return JSON.stringify(a) === JSON.stringify(b);
}

function CreateDefaultShape(): IColliderData
{
    return { type: EMGeometryType.Rectangle, x: 10, y: 10, width: 20, height: 20 };
}

function OnSwitchSlot(slot: TColliderSlot): void
{
    currentSlot.value = slot;
    if (localData.value.collider[slot] === null)
    {
        localData.value.collider[slot] = CreateDefaultShape();
        EmitUpdate();
    }
}

function OnBodyShapeUpdate(shape: IColliderData | null): void
{
    ApplyShape('body', shape);
}

function OnMouthShapeUpdate(shape: IColliderData | null): void
{
    ApplyShape('mouth', shape);
}

function OnDeleteCollider(): void
{
    ApplyShape(currentSlot.value, null);
}

function OnCreateCollider(): void
{
    ApplyShape(currentSlot.value, CreateDefaultShape());
}

function OnCopyShape(): void
{
    const shape = GetEffectiveShape(currentSlot.value);
    if (shape === null) return;
    colliderClipboardShared.value = JSON.parse(JSON.stringify(shape)) as IColliderData;
}

function OnPasteShape(): void
{
    if (colliderClipboardShared.value === null) return;
    ApplyShape(currentSlot.value, JSON.parse(JSON.stringify(colliderClipboardShared.value)) as IColliderData);
}

function OnResetOverride(slot: TColliderSlot): void
{
    const frameData = GetFrameData();
    if (frameData === undefined) return;
    if (frameData.colliderOverride[slot] !== undefined)
    {
        delete frameData.colliderOverride[slot];
        EmitUpdate();
    }
}

/** 应用形状修改：第 1 帧写入基础形状（null 表示删除碰撞体），其它帧写入稀疏覆盖 */
function ApplyShape(slot: TColliderSlot, shape: IColliderData | null): void
{
    if (props.frameIndex === 0)
    {
        localData.value.collider[slot] = shape;
        if (shape === null)
        {
            // 删除基础形状时清空所有帧中该槽位的覆盖
            for (const frame of localData.value.frameList)
            {
                delete frame.colliderOverride[slot];
            }
        }
        else
        {
            // 第 1 帧编辑的是基础形状，清理第 1 帧遗留的覆盖
            const frameData = GetFrameData();
            if (frameData !== undefined) delete frameData.colliderOverride[slot];
        }
    }
    else
    {
        const frameData = GetFrameData();
        if (frameData === undefined) return;
        if (shape === null || IsColliderEqual(shape, localData.value.collider[slot]))
        {
            // 与基础形状一致则不需要覆盖
            delete frameData.colliderOverride[slot];
        }
        else
        {
            frameData.colliderOverride[slot] = shape;
        }
    }
    EmitUpdate();
}

function EmitUpdate(): void
{
    emit('update:action', JSON.parse(JSON.stringify(localData.value)) as IActionData);
}
</script>

<style scoped>
.collisionEditor {
    display: flex;
    gap: 16px;
    padding: 16px;
}

.editorArea {
    flex: 1;
    min-width: 0;
}

.propPanel {
    width: 220px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tabBar {
    gap: 4px;
}

.tab {
    flex: 1;
    text-align: center;
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
    background: var(--sumiStudioCore-color-surface-container);
    color: var(--sumiStudioCore-color-surface-on);
}

.tab.active {
    background: var(--sumiStudioCore-color-primary-container);
    color: var(--sumiStudioCore-color-primary-container-on);
}

.toolRow {
    padding-top: 8px;
}

.overrideTag {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    background: var(--sumiStudioCore-color-surface-container-highest);
    color: var(--sumiStudioCore-color-surface-on-20);
    cursor: pointer;
    user-select: none;
}

.overrideTag:hover {
    color: var(--sumiStudioCore-color-error);
}

.frameTip {
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-20);
}
</style>
