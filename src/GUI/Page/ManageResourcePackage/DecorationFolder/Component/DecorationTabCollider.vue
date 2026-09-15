<template>
    <div class="wC_HSVS tabContent">
        <div v-if="isFrameAnimation" class="wR_HC frameNav">
            <span class="frameNavBtn" @click="OnPrevFrame">←</span>
            <span class="frameNavLabel">碰撞体 第 {{ currentFrameIndex + 1 }} / {{ totalFrames }} 帧{{ currentFrameIndex === 0 ? '（默认配置）' : '' }}</span>
            <span class="frameNavBtn" @click="OnNextFrame">→</span>
        </div>
        <div class="wR_HC colliderActions">
            <Button text="添加碰撞体" variant="outlined" @click="OnAdd" />
        </div>
        <div class="editorWrap">
            <div class="colliderList">
                <div v-for="(config, index) in colliderConfigList" :key="config.id" class="colliderCard" :class="{ active: currentIndex === index }" @click="OnSelect(index)">
                    <span class="colliderIndex">{{ index + 1 }}</span>
                    <select :value="GetEffectiveShape(config).type" @change="OnTypeChange($event, index)">
                        <option :value="EMGeometryType.Circle">圆形</option>
                        <option :value="EMGeometryType.Rectangle">矩形</option>
                        <option :value="EMGeometryType.Capsule">胶囊</option>
                        <option :value="EMGeometryType.Ellipse">椭圆</option>
                        <option :value="EMGeometryType.Polygon">多边形</option>
                        <option :value="EMGeometryType.Pie">扇形</option>
                        <option :value="EMGeometryType.Segment">线段</option>
                    </select>
                    <span v-if="HasShapeOverride(config.id)" class="overrideTag" title="该帧形状已被覆盖，点击重置为基础形状" @click.stop="OnResetShape(config.id)">已覆盖 ×</span>
                    <span class="colliderDelete" @click.stop="OnRemove(index)">×</span>
                </div>
            </div>
            <ShapeEditor class="shapeEditorFlex" :texture="editorTexture" :viewport="viewport" :shape-list="effectiveShapeList" :selected-index="currentIndex" :color="0xff8800" :animation-transform="animationTransform" @update:shape-list="OnListUpdate" @select="OnSelect" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import ShapeEditor, { type IShapeEditorViewport } from '../../Common/Component/ShapeEditor.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import {
    EMDecorationAnimationMode,
    type IDecorationPart, type IDecorationColliderConfig, type IDecorationColliderFrameOverride,
    type IColliderData, type IDecorationAnimationTransform, type IDecorationFrameData
} from '../../Types';
import { EMGeometryType } from '@/Core/Module/Collision2D_DLL/Geometry/GeometryType';
import type { Texture } from 'pixi.js';

const props = defineProps<{
    data: IResourcePackageData;
    decorationName: string;
    part: IDecorationPart;
    currentFrameIndex: number;
    editorTexture: Texture | null;
    animationTransform: IDecorationAnimationTransform | null;
    viewport: IShapeEditorViewport;
}>();

const emit = defineEmits<{
    (e: 'update'): void;
    (e: 'selectFrame', index: number): void;
}>();

const currentIndex = ref<number | undefined>(undefined);

const isFrameAnimation = computed<boolean>(() => props.part.animationMode === EMDecorationAnimationMode.Frame);

const totalFrames = computed<number>(() => props.part.frameAnimation?.frameList.length ?? 0);

const colliderConfigList = computed<IDecorationColliderConfig[]>(() => props.part.colliderList ?? []);

const effectiveShapeList = computed<IColliderData[]>(() => colliderConfigList.value.map(config => GetEffectiveShape(config)));

function GetEffectiveShape(config: IDecorationColliderConfig): IColliderData
{
    // 第 1 帧直接显示基础形状，其它帧优先显示帧级覆盖
    if (isFrameAnimation.value && props.currentFrameIndex > 0)
    {
        const override = GetFrameOverride(config.id);
        if (override !== undefined) return override.collider;
    }
    return config.collider;
}

function GetFrameData(): IDecorationFrameData | undefined
{
    return props.part.frameAnimation?.frameList[props.currentFrameIndex];
}

function GetFrameOverride(colliderID: string): IDecorationColliderFrameOverride | undefined
{
    return GetFrameData()?.colliderOverrideList.find(o => o.colliderID === colliderID);
}

function HasShapeOverride(colliderID: string): boolean
{
    // 第 1 帧编辑的是基础形状，不展示覆盖标记
    if (props.currentFrameIndex === 0) return false;
    return GetFrameOverride(colliderID) !== undefined;
}

function IsColliderEqual(a: IColliderData, b: IColliderData): boolean
{
    return JSON.stringify(a) === JSON.stringify(b);
}

function GenerateID(): string
{
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function Persist(): void
{
    props.data.SetDecorationPart(props.decorationName, props.part.id, JSON.parse(JSON.stringify(props.part)) as IDecorationPart);
    emit('update');
}

function ApplyShapeChange(index: number, shape: IColliderData): void
{
    const config = colliderConfigList.value[index];
    if (config === undefined) return;
    if (isFrameAnimation.value && props.currentFrameIndex > 0)
    {
        const frameData = GetFrameData();
        if (frameData === undefined) return;
        const overrideIndex = frameData.colliderOverrideList.findIndex(o => o.colliderID === config.id);
        if (IsColliderEqual(shape, GetEffectiveShape(config))) return;
        if (IsColliderEqual(shape, config.collider))
        {
            // 与基础形状一致则不需要覆盖
            if (overrideIndex !== -1) frameData.colliderOverrideList.splice(overrideIndex, 1);
        }
        else if (overrideIndex !== -1)
        {
            frameData.colliderOverrideList[overrideIndex].collider = shape;
        }
        else
        {
            frameData.colliderOverrideList.push({ colliderID: config.id, collider: shape });
        }
    }
    else
    {
        config.collider = shape;
        // 第 1 帧编辑的是基础形状，清理第 1 帧遗留的覆盖
        if (isFrameAnimation.value)
        {
            const frameData = GetFrameData();
            if (frameData !== undefined)
            {
                const overrideIndex = frameData.colliderOverrideList.findIndex(o => o.colliderID === config.id);
                if (overrideIndex !== -1) frameData.colliderOverrideList.splice(overrideIndex, 1);
            }
        }
    }
}

function OnAdd(): void
{
    const list = props.part.colliderList ?? (props.part.colliderList = []);
    list.push({
        id: GenerateID(),
        collider: { type: EMGeometryType.Rectangle, x: -20, y: -20, width: 40, height: 40 }
    });
    currentIndex.value = list.length - 1;
    Persist();
}

function OnRemove(index: number): void
{
    const config = colliderConfigList.value[index];
    if (config === undefined) return;
    colliderConfigList.value.splice(index, 1);
    // 清理所有帧中该碰撞体的覆盖
    if (props.part.frameAnimation !== undefined)
    {
        for (const frameData of props.part.frameAnimation.frameList)
        {
            const overrideIndex = frameData.colliderOverrideList.findIndex(o => o.colliderID === config.id);
            if (overrideIndex !== -1) frameData.colliderOverrideList.splice(overrideIndex, 1);
        }
    }
    if (currentIndex.value === index)
    {
        currentIndex.value = undefined;
    }
    else if (currentIndex.value !== undefined && currentIndex.value > index)
    {
        currentIndex.value--;
    }
    Persist();
}

function OnResetShape(colliderID: string): void
{
    const frameData = GetFrameData();
    if (frameData === undefined) return;
    const overrideIndex = frameData.colliderOverrideList.findIndex(o => o.colliderID === colliderID);
    if (overrideIndex !== -1)
    {
        frameData.colliderOverrideList.splice(overrideIndex, 1);
        Persist();
    }
}

function OnSelect(index: number): void
{
    currentIndex.value = index;
}

function OnTypeChange(event: Event, index: number): void
{
    const target = event.target as HTMLSelectElement;
    const type = Number(target.value) as EMGeometryType;
    let newCollider: IColliderData;
    switch (type)
    {
        case EMGeometryType.Circle:
            newCollider = { type: EMGeometryType.Circle, x: 10, y: 10, radius: 10 };
            break;
        case EMGeometryType.Capsule:
            newCollider = { type: EMGeometryType.Capsule, x: 10, y: 10, length: 20, radius: 5 };
            break;
        case EMGeometryType.Ellipse:
            newCollider = { type: EMGeometryType.Ellipse, x: 10, y: 10, width: 20, height: 15 };
            break;
        case EMGeometryType.Polygon:
            newCollider = { type: EMGeometryType.Polygon, x: 10, y: 10, vertics: [[0, 0], [20, 0], [20, 20], [0, 20]] };
            break;
        case EMGeometryType.Pie:
            newCollider = { type: EMGeometryType.Pie, x: 10, y: 10, radius: 15, sweep: 60 };
            break;
        case EMGeometryType.Segment:
            newCollider = { type: EMGeometryType.Segment, x: 10, y: 10, length: 20, normal: [0, 1] };
            break;
        default:
            newCollider = { type: EMGeometryType.Rectangle, x: 10, y: 10, width: 20, height: 20 };
    }
    ApplyShapeChange(index, newCollider);
    Persist();
}

function OnListUpdate(shapeList: IColliderData[]): void
{
    const configList = colliderConfigList.value;
    if (shapeList.length < configList.length)
    {
        // ShapeEditor 删除了选中项：找出被删位置按 part 级删除处理
        const removedIndex = FindRemovedIndex(effectiveShapeList.value, shapeList);
        OnRemove(removedIndex);
        return;
    }
    if (shapeList.length > configList.length)
    {
        // ShapeEditor 在末尾追加了新形状，包装为 part 级配置
        const list = props.part.colliderList ?? (props.part.colliderList = []);
        for (let i = configList.length; i < shapeList.length; i++)
        {
            list.push({ id: GenerateID(), collider: shapeList[i] });
        }
    }
    const count = Math.min(shapeList.length, configList.length);
    for (let i = 0; i < count; i++)
    {
        ApplyShapeChange(i, shapeList[i]);
    }
    Persist();
}

function FindRemovedIndex(oldList: IColliderData[], newList: IColliderData[]): number
{
    for (let i = 0; i < newList.length; i++)
    {
        if (IsColliderEqual(oldList[i], newList[i]) === false) return i;
    }
    return oldList.length - 1;
}

function OnPrevFrame(): void
{
    const total = totalFrames.value;
    if (total === 0) return;
    const newIndex = (props.currentFrameIndex - 1 + total) % total;
    emit('selectFrame', newIndex);
}

function OnNextFrame(): void
{
    const total = totalFrames.value;
    if (total === 0) return;
    const newIndex = (props.currentFrameIndex + 1) % total;
    emit('selectFrame', newIndex);
}
</script>
<style scoped>
.tabContent {
    flex: 1;
    overflow-y: auto;
    gap: 12px;
    padding-top: 8px;
}

.frameNav {
    gap: 8px;
    align-items: center;
    justify-content: center;
}

.frameNavLabel {
    font-size: 12px;
    color: var(--sumiStudioCore-color-surface-on-20);
}

.frameNavBtn {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    line-height: 24px;
    text-align: center;
    background: var(--sumiStudioCore-color-surface-container);
    color: var(--sumiStudioCore-color-surface-on);
    cursor: pointer;
    user-select: none;
}

.frameNavBtn:hover {
    background: var(--sumiStudioCore-color-surface-container-highest);
}

.colliderActions {
    gap: 8px;
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

.colliderList {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
}

.colliderCard {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 4px;
    background: var(--sumiStudioCore-color-surface-container);
    cursor: pointer;
}

.colliderCard.active {
    background: var(--sumiStudioCore-color-primary-container);
}

.colliderIndex {
    width: 18px;
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-20);
}

.colliderCard select {
    flex: 1;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    color: var(--sumiStudioCore-color-surface-on);
}

.colliderDelete {
    width: 18px;
    text-align: center;
    color: var(--sumiStudioCore-color-error);
}

.editorWrap {
    flex: 1;
    display: flex;
    gap: 16px;
    overflow: hidden;
    min-height: 0;
}

.shapeEditorFlex {
    flex: 1;
    min-height: 0;
}
</style>
