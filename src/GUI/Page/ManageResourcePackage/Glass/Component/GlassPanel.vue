<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">🪟 玻璃样式编辑：{{ styleName }}</span>

        <div class="wC_HSB basicInfo">
            <div class="propRow">
                <label>名称 Key</label>
                <input :value="item?.nameKey" type="text" placeholder="例如 glass.default.name" @change="OnUpdateItemField($event, 'nameKey')" />
            </div>
            <div class="propRow">
                <label>简介 Key</label>
                <input :value="item?.descriptionKey" type="text" placeholder="例如 glass.default.description" @change="OnUpdateItemField($event, 'descriptionKey')" />
            </div>
        </div>

        <div class="wC_HSB overallColorRow">
            <label>整体颜色</label>
            <input type="color" :value="overallColor" @input="OnOverallColorInput" />
            <span class="tip">仅用于快速统一配色，不会保存到 item.json</span>
        </div>

        <div class="wC_HS partSection">
            <div class="wR_HS partList">
                <div v-for="meta in GlassPartMetaList" :key="meta.key" :class="['partCard', selectedPart === meta.key ? 'partCard-select' : '']" @click="OnSelectPart(meta.key)">
                    <span class="partLabel">{{ meta.label }}</span>
                    <div class="partSummary">
                        <span v-if="GetPart(meta.key).type === EMGlassPartType.Color" class="partType">颜色</span>
                        <span v-else class="partType">纹理</span>
                        <div v-if="GetPart(meta.key).type === EMGlassPartType.Color" class="colorDot" :style="GetColorStyle(meta.key)"></div>
                        <span v-else class="textureName">{{ GetPart(meta.key).textureImage }}</span>
                    </div>
                </div>
            </div>

            <div v-if="selectedPart !== null" class="partEditor">
                <span class="sumiStudio_font_title-small editorTitle">{{ GetPartMeta(selectedPart).label }}</span>
                <div class="propRow">
                    <label>类型</label>
                    <SelectBox width="200px" v-model:value="selectedPartType" :list="GlassPartTypeOptionList" placeholder="请选择类型" />
                </div>

                <template v-if="selectedPartType === EMGlassPartType.Color">
                    <div class="propRow">
                        <label>颜色</label>
                        <input type="color" :value="selectedPartColor" @input="OnPartColorInput" />
                    </div>
                    <div class="propRow">
                        <label>不透明度</label>
                        <input type="range" min="0" max="255" :value="selectedPartAlpha" @input="OnPartAlphaInput" />
                        <span class="alphaValue">{{ selectedPartAlpha }}</span>
                    </div>
                </template>

                <template v-else>
                    <div class="wC_HCVCB textureUpload">
                        <div class="texturePreview" @click="OnUploadTextureClick">
                            <img v-if="selectedTextureUrl !== null" :src="selectedTextureUrl" class="textureImg" />
                            <span v-else class="texturePlaceholder">点击上传纹理</span>
                        </div>
                        <div class="wR_HC textureActions">
                            <Button text="上传纹理" variant="outlined" @click="OnUploadTextureClick" />
                            <Button v-if="selectedTextureUrl !== null" text="删除纹理" variant="outlined" @click="OnRemoveTexture" />
                        </div>
                    </div>
                    <div class="propRow">
                        <label>填充模式</label>
                        <SelectBox width="200px" v-model:value="selectedPartTextureMode" :list="GlassTextureModeOptionList" placeholder="请选择填充模式" />
                    </div>
                </template>
            </div>
        </div>

        <div class="previewSection">
            <div class="wR_HS previewHeader">
                <span class="sumiStudio_font_title-small previewTitle">预览</span>
                <Button text="从预览生成缩略图" variant="outlined" @click="GenerateThumbnailFromPreview" />
            </div>
            <div ref="previewWrapRef" class="previewWrap"></div>
        </div>
    </div>
    <input ref="textureInputRef" type="file" accept="image/*" style="display: none;" @change="OnTextureSelected" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Application, Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import {
    EMGlassPartType, GlassPartTypeOptionList, EMGlassTextureMode, GlassTextureModeOptionList,
    GlassPartMetaList, GLASS_DEFAULT_OVERALL_COLOR,
    type IGlassStyleItem, type IGlassPart, type TGlassPartKey
} from '../TypeGlass';

const props = defineProps<{
    data: IResourcePackageData;
    styleName: string;
}>();

const textureInputRef = ref<HTMLInputElement | null>(null);
const selectedPart = ref<TGlassPartKey | null>('BackSurface');
const selectedTextureUrl = ref<string | null>(null);
const overallColor = ref<string>(GLASS_DEFAULT_OVERALL_COLOR);

const previewWrapRef = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let rootContainer: Container | null = null;
const colorGraphicsMap = new Map<TGlassPartKey, Graphics[]>();
const textureSpriteMap = new Map<TGlassPartKey, (Sprite | TilingSprite)[]>();
const textureMaskMap = new Map<TGlassPartKey, Graphics[]>();
const textureCacheMap = new Map<string, Texture>();
let renderGeneration = 0;
let pendingRender: Promise<void> | null = null;

const item = computed(() => props.data.GetGlassItem(props.styleName));

const selectedPartType = computed<number>({
    get: () => GetPart(selectedPart.value ?? 'BackSurface').type,
    set: (value: number) =>
    {
        UpdatePartField(selectedPart.value ?? 'BackSurface', 'type', value);
    }
});

const selectedPartColor = computed<string>(() => GetPart(selectedPart.value ?? 'BackSurface').color);
const selectedPartAlpha = computed<number>(() => GetPart(selectedPart.value ?? 'BackSurface').alpha);
const selectedPartTextureMode = computed<number>({
    get: () => GetPart(selectedPart.value ?? 'BackSurface').textureMode,
    set: (value: number) =>
    {
        UpdatePartField(selectedPart.value ?? 'BackSurface', 'textureMode', value);
    }
});

watch(() => props.styleName, () =>
{
    for (const texture of textureCacheMap.values())
    {
        texture.destroy(true);
    }
    textureCacheMap.clear();
    LoadSelectedTexture();
    RenderPreview();
}, { immediate: true });

onMounted(async () =>
{
    if (previewWrapRef.value === null) return;

    app = new Application();
    await app.init({
        width: 480,
        height: 320,
        backgroundAlpha: 0,
        preserveDrawingBuffer: true,
        canvas: document.createElement('canvas')
    });
    previewWrapRef.value.appendChild(app.canvas);

    rootContainer = new Container();
    rootContainer.position.set(240, 160);
    app.stage.addChild(rootContainer);

    RenderPreview();
});

onUnmounted(() =>
{
    app?.destroy(true);
    app = null;
    rootContainer = null;
    colorGraphicsMap.clear();
    textureSpriteMap.clear();
    textureMaskMap.clear();
    for (const texture of textureCacheMap.values())
    {
        texture.destroy(true);
    }
    textureCacheMap.clear();
});

function GetPart(key: TGlassPartKey): IGlassPart
{
    return item.value?.partMap[key] ?? {
        type: EMGlassPartType.Color,
        color: GLASS_DEFAULT_OVERALL_COLOR,
        alpha: 255,
        textureImage: `${key}.png`,
        textureMode: EMGlassTextureMode.Stretch
    };
}

function GetPartMeta(key: TGlassPartKey)
{
    return GlassPartMetaList.find(m => m.key === key)!;
}

function GetColorStyle(key: TGlassPartKey)
{
    const part = GetPart(key);
    return {
        backgroundColor: part.color,
        opacity: part.alpha / 255
    };
}

function OnSelectPart(key: TGlassPartKey): void
{
    selectedPart.value = key;
    LoadSelectedTexture();
}

function OnUpdateItemField(event: Event, field: 'nameKey' | 'descriptionKey'): void
{
    if (item.value === undefined) return;
    item.value[field] = (event.target as HTMLInputElement).value;
    CommitItem();
}

function CommitItem(): void
{
    if (item.value === undefined) return;
    props.data.SetGlassItem(props.styleName, JSON.parse(JSON.stringify(item.value)) as IGlassStyleItem);
    RenderPreview();
}

function UpdatePartField(key: TGlassPartKey, field: keyof IGlassPart, value: unknown): void
{
    if (item.value === undefined) return;
    const part = item.value.partMap[key];
    if (part === undefined) return;
    (part as unknown as Record<string, unknown>)[field] = value;

    // 从纹理切换到颜色时，清理纹理数据
    if (field === 'type' && value === EMGlassPartType.Color)
    {
        props.data.SetGlassTexture(props.styleName, key, null);
        const cached = textureCacheMap.get(key);
        if (cached !== undefined)
        {
            cached.destroy(true);
            textureCacheMap.delete(key);
        }
    }

    CommitItem();
}

function OnPartColorInput(event: Event): void
{
    UpdatePartField(selectedPart.value ?? 'BackSurface', 'color', (event.target as HTMLInputElement).value);
}

function OnPartAlphaInput(event: Event): void
{
    UpdatePartField(selectedPart.value ?? 'BackSurface', 'alpha', parseInt((event.target as HTMLInputElement).value, 10));
}

function OnOverallColorInput(event: Event): void
{
    const color = (event.target as HTMLInputElement).value;
    overallColor.value = color;
    if (item.value === undefined) return;

    for (const meta of GlassPartMetaList)
    {
        const part = item.value.partMap[meta.key];
        if (part === undefined) continue;
        if (part.type === EMGlassPartType.Color)
        {
            part.color = color;
        }
    }
    CommitItem();
}

async function GenerateThumbnailFromPreview(): Promise<void>
{
    if (app === null || app.canvas === undefined) return;

    // 等待当前渲染完成
    if (pendingRender !== null)
    {
        await pendingRender;
    }

    // 强制立即渲染一次，确保画布内容已写入，避免捕获到空白帧
    app.render();

    const sourceCanvas = app.canvas;
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;

    const sourceWidth = sourceCanvas.width;
    const sourceHeight = sourceCanvas.height;
    const targetSize = 100;
    const sourceRatio = sourceWidth / sourceHeight;
    const targetRatio = targetSize / targetSize;

    let drawWidth: number;
    let drawHeight: number;

    if (sourceRatio > targetRatio)
    {
        drawHeight = targetSize;
        drawWidth = sourceWidth * (targetSize / sourceHeight);
    }
    else
    {
        drawWidth = targetSize;
        drawHeight = sourceHeight * (targetSize / sourceWidth);
    }

    const offsetX = (targetSize - drawWidth) / 2;
    const offsetY = (targetSize - drawHeight) / 2;

    ctx.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob === null) return;

    const buffer = await blob.arrayBuffer();
    props.data.SetGlassImage(props.styleName, new Uint8Array(buffer));
}

function OnUploadTextureClick(): void
{
    textureInputRef.value?.click();
}

async function OnTextureSelected(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files === null || files.length === 0) return;

    const key = selectedPart.value ?? 'BackSurface';
    const data = new Uint8Array(await files[0].arrayBuffer());
    props.data.SetGlassTexture(props.styleName, key, data);

    const cached = textureCacheMap.get(key);
    if (cached !== undefined)
    {
        cached.destroy(true);
        textureCacheMap.delete(key);
    }

    if (item.value !== undefined)
    {
        item.value.partMap[key].textureImage = `${key}.png`;
        item.value.partMap[key].type = EMGlassPartType.Texture;
        CommitItem();
    }

    LoadSelectedTexture();
    await RenderPreview();
    input.value = '';
}

function OnRemoveTexture(): void
{
    const key = selectedPart.value ?? 'BackSurface';
    props.data.SetGlassTexture(props.styleName, key, null);

    const cached = textureCacheMap.get(key);
    if (cached !== undefined)
    {
        cached.destroy(true);
        textureCacheMap.delete(key);
    }

    if (item.value !== undefined)
    {
        item.value.partMap[key].type = EMGlassPartType.Color;
        CommitItem();
    }
    LoadSelectedTexture();
    RenderPreview();
}

function LoadSelectedTexture(): void
{
    const key = selectedPart.value ?? 'BackSurface';
    selectedTextureUrl.value = GetDataURL(props.data.GetGlassTexture(props.styleName, key));
}

function GetDataURL(data: Uint8Array | null | undefined): string | null
{
    if (data === null || data === undefined || data.length === 0) return null;
    const blob = new Blob([data.slice()], { type: 'image/png' });
    return URL.createObjectURL(blob);
}

// #region Preview

interface IGlassPolygon
{
    points: number[];
    bounds: { x: number; y: number; width: number; height: number };
}

function BuildTankPolygons(): Record<TGlassPartKey, IGlassPolygon[]>
{
    const W = 300;
    const H = 170;
    const WALL_THICKNESS = 16;
    const TOP_INSET = 10;
    const BOTTOM_INSET = 20;
    const STRIP_THICKNESS = 2;

    function Rect(left: number, top: number, width: number, height: number): IGlassPolygon
    {
        return {
            points: [left, top, left + width, top, left + width, top + height, left, top + height],
            bounds: { x: left, y: top, width, height }
        };
    }

    function Quad(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, d: { x: number; y: number }): IGlassPolygon
    {
        const minX = Math.min(a.x, b.x, c.x, d.x);
        const minY = Math.min(a.y, b.y, c.y, d.y);
        const maxX = Math.max(a.x, b.x, c.x, d.x);
        const maxY = Math.max(a.y, b.y, c.y, d.y);
        return {
            points: [a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y],
            bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
        };
    }

    return {
        LeftSurface: [Quad(
            { x: -W / 2, y: H / 2 },
            { x: -W / 2 + WALL_THICKNESS, y: H / 2 - BOTTOM_INSET },
            { x: -W / 2 + WALL_THICKNESS, y: -H / 2 - TOP_INSET },
            { x: -W / 2, y: -H / 2 }
        )],
        BackSurface: [Rect(
            -W / 2 + WALL_THICKNESS,
            -H / 2 - TOP_INSET,
            W - WALL_THICKNESS * 2,
            H - BOTTOM_INSET + TOP_INSET
        )],
        FrontSurface: [Rect(
            -W / 2,
            -H / 2,
            W,
            H
        )],
        RightSurface: [Quad(
            { x: W / 2, y: -H / 2 },
            { x: W / 2 - WALL_THICKNESS, y: -H / 2 - TOP_INSET },
            { x: W / 2 - WALL_THICKNESS, y: H / 2 - BOTTOM_INSET },
            { x: W / 2, y: H / 2 }
        )],
        BottomSurface: [Quad(
            { x: -W / 2, y: H / 2 },
            { x: -W / 2 + WALL_THICKNESS, y: H / 2 - BOTTOM_INSET },
            { x: W / 2 - WALL_THICKNESS, y: H / 2 - BOTTOM_INSET },
            { x: W / 2, y: H / 2 }
        )],
        GlassEdge: [
            Rect(-W / 2 - 1, -H / 2, STRIP_THICKNESS, H),
            Rect(W / 2 - 1, -H / 2, STRIP_THICKNESS, H),
            Rect(-W / 2, -H / 2, W, STRIP_THICKNESS),
            Rect(-W / 2 - 1, H / 2 - STRIP_THICKNESS, W + STRIP_THICKNESS, STRIP_THICKNESS)
        ]
    };
}

async function RenderPreview(): Promise<void>
{
    if (rootContainer === null) return;

    const generation = ++renderGeneration;
    ClearPreview();

    pendingRender = (async () =>
    {

    const polygons = BuildTankPolygons();
    const partKeys: TGlassPartKey[] = [
        'LeftSurface', 'BackSurface', 'RightSurface',
        'BottomSurface', 'GlassEdge', 'FrontSurface'
    ];

    const texturePromises: Promise<void>[] = [];
    const pendingTexturePartList: { key: TGlassPartKey; spriteList: (Sprite | TilingSprite)[]; maskList: Graphics[] }[] = [];

    for (const key of partKeys)
    {
        const part = GetPart(key);
        const polygonList = polygons[key];

        if (part.type === EMGlassPartType.Color)
        {
            const graphicsList: Graphics[] = [];

            for (const polygon of polygonList)
            {
                const g = new Graphics();
                g.poly(polygon.points);
                g.fill({ color: ParseHexColor(part.color), alpha: part.alpha / 255 });
                rootContainer.addChild(g);
                graphicsList.push(g);
            }
            colorGraphicsMap.set(key, graphicsList);
        }
        else
        {
            const data = props.data.GetGlassTexture(props.styleName, key);
            if (data !== null && data !== undefined && data.length > 0)
            {
                const spriteList: (Sprite | TilingSprite)[] = [];
                const maskList: Graphics[] = [];

                pendingTexturePartList.push({ key, spriteList, maskList });

                for (const polygon of polygonList)
                {
                    texturePromises.push(RenderTexturePart(key, data, polygon, generation, spriteList, maskList));
                }
            }
        }
    }

        await Promise.all(texturePromises);

        // 纹理异步加载完成后才统一登记；期间若已有更新一代渲染，对应对象不会被创建，直接放弃登记
        if (generation !== renderGeneration) return;

        for (const pending of pendingTexturePartList)
        {
            if (pending.spriteList.length > 0)
            {
                textureSpriteMap.set(pending.key, pending.spriteList);
            }

            if (pending.maskList.length > 0)
            {
                textureMaskMap.set(pending.key, pending.maskList);
            }
        }
    })();
    await pendingRender;
}

async function RenderTexturePart(key: TGlassPartKey, data: Uint8Array, polygon: IGlassPolygon, generation: number, spriteList: (Sprite | TilingSprite)[], maskList: Graphics[]): Promise<void>
{
    if (rootContainer === null) return;

    const part = GetPart(key);

    let texture = textureCacheMap.get(key);
    if (texture === undefined || texture.destroyed)
    {
        const blob = new Blob([data.slice()], { type: "image/png" });
        const bitmap = await createImageBitmap(blob);

        // 如果在此期间触发了新的渲染，放弃本次绘制
        if (generation !== renderGeneration) return;

        texture = Texture.from(bitmap);

        textureCacheMap.set(key, texture);
    }

    // -----------------------------
    // 创建局部坐标的 Mask
    // -----------------------------

    const localPoints: number[] = [];

    for (let i = 0; i < polygon.points.length; i += 2)
    {
        localPoints.push(
            polygon.points[i] - polygon.bounds.x,
            polygon.points[i + 1] - polygon.bounds.y
        );
    }

    const mask = new Graphics();

    mask.poly(localPoints);

    mask.fill({
        color: 0xffffff,
        alpha: 1
    });

    // Mask 与 Sprite 放到同一个坐标系
    mask.position.set(
        polygon.bounds.x,
        polygon.bounds.y
    );

    rootContainer.addChild(mask);

    maskList.push(mask);

    // -----------------------------
    // 创建 Sprite
    // -----------------------------

    let sprite: Sprite | TilingSprite;

    if (part.textureMode === EMGlassTextureMode.Tile)
    {
        sprite = new TilingSprite({
            texture,
            width: polygon.bounds.width,
            height: polygon.bounds.height
        });
    }
    else
    {
        sprite = new Sprite(texture);

        sprite.width = polygon.bounds.width;
        sprite.height = polygon.bounds.height;
    }

    // 与 Mask 使用相同坐标
    sprite.position.set(
        polygon.bounds.x,
        polygon.bounds.y
    );

    sprite.alpha = part.alpha / 255;

    sprite.mask = mask;

    rootContainer.addChild(sprite);

    spriteList.push(sprite);
}

function ClearPreview(): void
{
    for (const list of colorGraphicsMap.values())
    {
        for (const g of list)
        {
            rootContainer?.removeChild(g);
            g.destroy();
        }
    }
    colorGraphicsMap.clear();

    for (const list of textureSpriteMap.values())
    {
        for (const sprite of list)
        {
            rootContainer?.removeChild(sprite);
            sprite.destroy();
        }
    }
    textureSpriteMap.clear();

    for (const list of textureMaskMap.values())
    {
        for (const mask of list)
        {
            rootContainer?.removeChild(mask);
            mask.destroy();
        }
    }
    textureMaskMap.clear();
}

function ParseHexColor(hex: string): number
{
    const normalized = hex.replace('#', '');
    if (normalized.length === 3)
    {
        const r = parseInt(normalized[0] + normalized[0], 16);
        const g = parseInt(normalized[1] + normalized[1], 16);
        const b = parseInt(normalized[2] + normalized[2], 16);
        return (r << 16) | (g << 8) | b;
    }
    return parseInt(normalized, 16);
}
</script>

<style scoped>
.panel {
    padding: 16px 24px;
    flex: 1;
    overflow: auto;
    gap: 12px;
}

.panelTitle {
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
}

.basicInfo {
    gap: 12px;
    flex-shrink: 0;
}

.propRow {
    display: flex;
    align-items: center;
    gap: 8px;
}

.propRow label {
    width: 80px;
    font-size: 12px;
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
}

.propRow input[type="text"] {
    flex: 1;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    color: var(--sumiStudioCore-color-surface-on);
}

.propRow input[type="color"] {
    width: 48px;
    height: 28px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
}

.propRow input[type="range"] {
    flex: 1;
}

.alphaValue {
    width: 40px;
    font-size: 12px;
    color: var(--sumiStudioCore-color-surface-on);
    text-align: right;
}

.previewHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.overallColorRow label {
    width: 80px;
    font-size: 12px;
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
}

.overallColorRow .tip {
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-40);
}

.partCard {
    padding: 10px 12px;
    border-radius: 4px;
    background: var(--sumiStudioCore-color-surface-container);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: background-color 0.15s;
}

.partCard:hover {
    background: var(--sumiStudioCore-color-surface-container-high);
}

.partCard-select {
    background: var(--sumiStudioCore-color-primary-container);
}

.partLabel {
    font-size: 13px;
    color: var(--sumiStudioCore-color-surface-on);
}

.partSummary {
    display: flex;
    align-items: center;
    gap: 8px;
}

.partType {
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-60);
}

.colorDot {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-surface-variant-on);
}

.textureName {
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-40);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.partEditor {
    flex: 1;
    min-width: 0;
    padding: 16px;
    border-radius: 4px;
    background: var(--sumiStudioCore-color-surface-container);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.editorTitle {
    color: var(--sumiStudioCore-color-surface-on);
}

.textureUpload {
    gap: 12px;
    align-items: flex-start;
}

.texturePreview {
    width: 180px;
    height: 180px;
    border-radius: 4px;
    background: var(--sumiStudioCore-color-surface-container-highest);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
}

.textureImg {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.texturePlaceholder {
    font-size: 12px;
    text-align: center;
    color: var(--sumiStudioCore-color-surface-on-20);
}

.textureActions {
    gap: 8px;
}

.previewSection {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
}

.previewTitle {
    color: var(--sumiStudioCore-color-surface-on);
}

.previewWrap {
    height: 320px;
    border-radius: 4px;
    background: var(--sumiStudioCore-color-surface-container-highest);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
</style>
