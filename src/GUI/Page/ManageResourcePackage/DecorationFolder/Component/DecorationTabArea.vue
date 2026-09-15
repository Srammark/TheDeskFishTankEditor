<template>
    <div class="wC_HSVS tabContent" style="min-height: 0; height: 100%;">
        <div v-if="isFrameAnimation" class="wR_HC frameNav">
            <span class="frameNavBtn" @click="OnPrevFrame">←</span>
            <span class="frameNavLabel">区域 第 {{ currentFrameIndex + 1 }} / {{ totalFrames }} 帧{{ currentFrameIndex === 0 ? '（默认形状）' : '' }}</span>
            <span class="frameNavBtn" @click="OnNextFrame">→</span>
        </div>
        <div class="wR_HC areaActions">
            <Button text="添加区域" variant="outlined" @click="OnAdd" />
        </div>
        <div class="wR_HS" style="min-height: 0; gap: 16px; flex: 1; flex-wrap: nowrap;">
            <div class="wC_HC" style="width: 300px; min-height: 0; overflow: auto; gap: 8px;">
                <div v-for="(area, index) in areaList" :key="area.id" class="wC_HSB areaCard" :class="{ active: currentIndex === index }" style="gap: 4px;" @click="OnSelect(index)">
                    <div class="wR_HC areaHeader">
                        <InputBox v-model:text="area.name" style="flex: 1;" @blur="Persist" />
                        <span class="areaDelete" @click.stop="OnRemove(index)">×</span>
                    </div>
                    <div class="propRow">
                        <label>类型</label>
                        <SelectBox :value="area.area.type" :list="DecorationAreaTypeOptionList" style="flex: 1;" @update:value="OnTypeChange($event, index)" />
                    </div>
                    <div v-if="area.area.type === EMDecorationAreaType.Shelter" class="wC_HS" style="gap: 4px;">
                        <div class="propRow"><label>隐蔽度</label><NumericInlineInput v-model="(area.area as IDecorationAreaShelter).concealment" :precision="1" :min="0" :max="1" style="flex: 1;" @change="Persist" /></div>
                        <div class="propRow"><label>休息效率</label><NumericInlineInput v-model="(area.area as IDecorationAreaShelter).restEfficiency" :precision="1" :min="0" :max="1" style="flex: 1;" @change="Persist" /></div>
                        <div class="propRow"><label>舒适度</label><NumericInlineInput v-model="(area.area as IDecorationAreaShelter).comfort" :precision="1" :min="0" :max="1" style="flex: 1;" @change="Persist" /></div>
                        <div class="propRow"><label>最大鱼数</label><NumericInlineInput v-model="(area.area as IDecorationAreaShelter).maxFishCount" :precision="0" :min="0" style="flex: 1;" @change="Persist" /></div>
                    </div>
                    <div v-if="area.area.type === EMDecorationAreaType.Food" class="wC_HS" style="gap: 4px;">
                        <div class="propRow"><label>食物类型</label><SelectBox v-model:value="(area.area as IDecorationAreaFood).foodType" :list="FoodTypeOptionList" style="flex: 1;" @update:value="Persist" /></div>
                        <div class="propRow"><label>生成速率</label><NumericInlineInput v-model="(area.area as IDecorationAreaFood).foodPerSecond" :precision="1" :min="0" style="flex: 1;" @change="Persist" /></div>
                        <div class="propRow"><label>最大食物</label><NumericInlineInput v-model="(area.area as IDecorationAreaFood).maxFood" :precision="0" :min="0" style="flex: 1;" @change="Persist" /></div>
                        <div class="propRow"><label>初始食物</label><NumericInlineInput v-model="(area.area as IDecorationAreaFood).initialFood" :precision="0" :min="0" style="flex: 1;" @change="Persist" /></div>
                        <div class="propRow"><label>显示食物</label><input type="checkbox" v-model="(area.area as IDecorationAreaFood).isShowFood" @change="Persist" /></div>
                    </div>
                    <div v-if="isFrameAnimation" class="frameStateRow">
                        <label class="visibleToggle">
                            <input type="checkbox" :checked="IsAreaVisibleInFrame(area.id)" @change="OnVisibleChange(area.id, $event)" />
                            本帧显示
                        </label>
                        <span v-if="HasShapeOverride(area.id)" class="overrideTag" title="该帧形状已被覆盖，点击重置为基础形状" @click.stop="OnResetShape(area.id)">已覆盖形状 ×</span>
                    </div>
                </div>
            </div>
            <ShapeEditor v-if="currentArea !== undefined" class="shapeEditorFlex" :texture="editorTexture" :viewport="viewport" :shape="currentShape" :color="GetAreaColor(currentArea.area.type)" :animation-transform="animationTransform" @update:shape="OnShapeUpdate" />
            <div v-else class="shapeEditorFlex placeholder">
                <span class="sumiStudio_font_body-large" style="color: var(--sumiStudioCore-color-surface-on-20);">请添加或选择一个区域</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import InputBox from '@/Core/Module/GUI/Control_DLL/InputBox/InputBox.vue';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import NumericInlineInput from '@/Core/Module/GUI/Control_DLL/NumericInlineInput/NumericInlineInput.vue';
import ShapeEditor, { type IShapeEditorViewport } from '../../Common/Component/ShapeEditor.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import {
    EMDecorationAnimationMode, EMDecorationAreaType, DecorationAreaTypeOptionList,
    FoodTypeOptionList,
    type IDecorationPart, type IDecorationAreaConfig, type IDecorationAreaShelter,
    type IDecorationAreaFood, type IDecorationFrameData,
    type IDecorationAreaFrameOverride,
    type IDecorationAnimationTransform, type IColliderData
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

const areaList = computed<IDecorationAreaConfig[]>(() => props.part.areaList);

const currentArea = computed<IDecorationAreaConfig | undefined>(() =>
{
    if (currentIndex.value === undefined) return undefined;
    return areaList.value[currentIndex.value];
});

const currentShape = computed<IColliderData | undefined>(() =>
{
    const area = currentArea.value;
    if (area === undefined) return undefined;
    // 第 1 帧直接显示基础形状（默认值），其它帧优先显示帧级覆盖
    if (isFrameAnimation.value && props.currentFrameIndex > 0)
    {
        const override = GetFrameOverride(area.id);
        if (override?.collider !== undefined) return override.collider;
    }
    return area.collider;
});

function GetFrameData(): IDecorationFrameData | undefined
{
    return props.part.frameAnimation?.frameList[props.currentFrameIndex];
}

function GetFrameOverride(areaID: string): IDecorationAreaFrameOverride | undefined
{
    return GetFrameData()?.areaOverrideList.find(o => o.areaID === areaID);
}

function EnsureFrameOverride(areaID: string): IDecorationAreaFrameOverride | undefined
{
    const frameData = GetFrameData();
    if (frameData === undefined) return undefined;
    let override = frameData.areaOverrideList.find(o => o.areaID === areaID);
    if (override === undefined)
    {
        override = { areaID };
        frameData.areaOverrideList.push(override);
    }
    return override;
}

function RemoveFrameOverrideIfEmpty(areaID: string): void
{
    const frameData = GetFrameData();
    if (frameData === undefined) return;
    const index = frameData.areaOverrideList.findIndex(o => o.areaID === areaID);
    if (index === -1) return;
    const override = frameData.areaOverrideList[index];
    if (override.visible === undefined && override.collider === undefined)
    {
        frameData.areaOverrideList.splice(index, 1);
    }
}

function IsAreaVisibleInFrame(areaID: string): boolean
{
    return GetFrameOverride(areaID)?.visible ?? true;
}

function HasShapeOverride(areaID: string): boolean
{
    // 第 1 帧编辑的是基础形状，不展示覆盖标记
    if (props.currentFrameIndex === 0) return false;
    return GetFrameOverride(areaID)?.collider !== undefined;
}

function Persist(): void
{
    props.data.SetDecorationPart(props.decorationName, props.part.id, JSON.parse(JSON.stringify(props.part)) as IDecorationPart);
    emit('update');
}

function GenerateID(): string
{
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function OnAdd(): void
{
    const newArea: IDecorationAreaConfig = {
        id: GenerateID(),
        name: `区域 ${areaList.value.length + 1}`,
        area: { type: EMDecorationAreaType.Shelter, concealment: 0.5, restEfficiency: 0.5, comfort: 0.5, maxFishCount: 3 },
        collider: { type: EMGeometryType.Rectangle, x: -20, y: -20, width: 40, height: 40 }
    };
    areaList.value.push(newArea);
    currentIndex.value = areaList.value.length - 1;
    Persist();
}

function OnRemove(index: number): void
{
    const area = areaList.value[index];
    areaList.value.splice(index, 1);
    // 清理所有帧中该区域的覆盖记录
    if (props.part.frameAnimation !== undefined)
    {
        for (const frameData of props.part.frameAnimation.frameList)
        {
            const overrideIndex = frameData.areaOverrideList.findIndex(o => o.areaID === area.id);
            if (overrideIndex !== -1)
            {
                frameData.areaOverrideList.splice(overrideIndex, 1);
            }
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

function OnSelect(index: number): void
{
    currentIndex.value = index;
}

function OnTypeChange(value: string | number | undefined, index: number): void
{
    if (value === undefined) return;
    const type = value as EMDecorationAreaType;
    const area = areaList.value[index];

    switch (type)
    {
        case EMDecorationAreaType.Shelter:
            area.area = { type, concealment: 0.5, restEfficiency: 0.5, comfort: 0.5, maxFishCount: 3 };
            break;
        case EMDecorationAreaType.Food:
            area.area = { type, foodType: 'Feed', foodPerSecond: 0.5, maxFood: 20, initialFood: 5, isShowFood: true };
            break;
    }
    Persist();
}

function OnShapeUpdate(shape: IColliderData | null): void
{
    const area = currentArea.value;
    if (area === undefined || shape === null) return;
    if (isFrameAnimation.value && props.currentFrameIndex > 0)
    {
        const override = EnsureFrameOverride(area.id);
        if (override === undefined) return;
        override.collider = shape;
    }
    else
    {
        area.collider = shape;
        // 第 1 帧编辑的是基础形状，清理第 1 帧遗留的形状覆盖
        if (isFrameAnimation.value)
        {
            const override = GetFrameOverride(area.id);
            if (override?.collider !== undefined)
            {
                override.collider = undefined;
                RemoveFrameOverrideIfEmpty(area.id);
            }
        }
    }
    Persist();
}

function OnVisibleChange(areaID: string, event: Event): void
{
    const checked = (event.target as HTMLInputElement).checked;
    const override = EnsureFrameOverride(areaID);
    if (override === undefined) return;
    override.visible = checked ? undefined : false;
    RemoveFrameOverrideIfEmpty(areaID);
    Persist();
}

function OnResetShape(areaID: string): void
{
    const override = GetFrameOverride(areaID);
    if (override === undefined) return;
    override.collider = undefined;
    RemoveFrameOverrideIfEmpty(areaID);
    Persist();
}

function GetAreaColor(type: EMDecorationAreaType): number
{
    switch (type)
    {
        case EMDecorationAreaType.Shelter: return 0x00ff00;
        case EMDecorationAreaType.Food: return 0xffaa00;
        default: return 0x888888;
    }
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

.areaActions {
    gap: 8px;
}

.areaCard {
    padding: 12px;
    background: var(--sumiStudioCore-color-surface-container);
    border-radius: 4px;
    cursor: pointer;
}

.areaCard.active {
    background: var(--sumiStudioCore-color-primary-container);
}

.areaHeader {
    justify-content: space-between;
    align-items: center;
}

.areaDelete {
    width: 18px;
    text-align: center;
    color: var(--sumiStudioCore-color-error);
}

.frameStateRow {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--sumiStudioCore-color-surface-container-highest);
}

.visibleToggle {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--sumiStudioCore-color-surface-on);
    cursor: pointer;
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

.propRow {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
}

.propRow label {
    width: 80px;
    font-size: 12px;
    color: var(--sumiStudioCore-color-surface-on);
}

.shapeEditorFlex {
    flex: 1;
    min-height: 0;
}

.shapeEditorFlex.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sumiStudioCore-color-surface-container-highest);
    border-radius: 4px;
}
</style>
