<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">🪸 装饰物预览：{{ decorationName }}</span>

        <div class="wC_HSB basicInfo">
            <div class="propRow">
                <label>名称 Key</label>
                <input :value="item?.nameKey" type="text" placeholder="例如 decoration.apple.name" @change="OnUpdateItemField($event, 'nameKey')" />
            </div>
            <div class="propRow">
                <label>简介 Key</label>
                <input :value="item?.descriptionKey" type="text" placeholder="例如 decoration.apple.description" @change="OnUpdateItemField($event, 'descriptionKey')" />
            </div>
            <div class="propRow">
                <label>分类</label>
                <SelectBox width="200px" v-model:value="category" :list="DecorationCategoryOptionList" placeholder="请选择分类" />
            </div>
        </div>

        <div class="wC_HS thumbnailRow">
            <span class="thumbnailLabel">装饰物缩略图</span>
            <div class="wC_HCVCB thumbnailWrap">
                <div class="avatarBox" @click="OnUploadThumbnailClick">
                    <img v-if="thumbnailUrl !== null" :src="thumbnailUrl" class="avatarImg" />
                    <span v-else class="avatarPlaceholder">无缩略图<br />点击上传</span>
                </div>
                <div class="wR_HC thumbnailActions">
                    <Button text="上传缩略图" variant="outlined" @click="OnUploadThumbnailClick" />
                    <Button v-if="thumbnailUrl !== null" text="删除缩略图" variant="outlined" @click="OnRemoveThumbnail" />
                </div>
                <span class="thumbnailTip">推荐尺寸 100 × 100 像素，上传后会自动等比例缩放</span>
            </div>
        </div>

        <div v-if="partList.length === 0" class="wR_HCVC placeholder">
            <span class="sumiStudio_font_body-large" style="color: var(--sumiStudioCore-color-surface-on-20);">该装饰物暂无子部件</span>
        </div>
        <div v-else ref="previewWrapRef" class="previewWrap"></div>
    </div>
    <input ref="thumbnailInputRef" type="file" accept="image/*" style="display: none;" @change="OnThumbnailSelected" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Application, Sprite, Texture, Graphics, Container, TextureSource } from 'pixi.js';

TextureSource.defaultOptions.scaleMode = 'nearest';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import {
    EMDecorationAnimationMode, EMDecorationCategory, DecorationCategoryOptionList,
    type IDecorationPart, type IDecorationFrameAnimation, type IDecorationItem,
    ComputeDecorationAnimationTransform
} from '../../Types';
import * as SpriteSheetUtil from '../../SpriteSheetUtil';

const props = defineProps<{
    data: IResourcePackageData;
    decorationName: string;
}>();

const previewWrapRef = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let rootContainer: Container | null = null;
let grid: Graphics | null = null;
const spriteMap = new Map<string, Sprite>();
const textureMap = new Map<string, Texture>();
const frameTextureMap = new Map<string, Texture[]>();
const sheetTextureMap = new Map<string, Texture>();
const thumbnailInputRef = ref<HTMLInputElement | null>(null);
const thumbnailUrl = ref<string | null>(null);

watch(() => props.decorationName, () =>
{
    LoadThumbnail();
}, { immediate: true });

function LoadThumbnail(): void
{
    const imageData = props.data.GetDecorationImage(props.decorationName);
    if (imageData !== null && imageData !== undefined && imageData.length > 0)
    {
        const blob = new Blob([imageData.slice()], { type: 'image/png' });
        thumbnailUrl.value = URL.createObjectURL(blob);
    }
    else
    {
        thumbnailUrl.value = null;
    }
}

function OnUploadThumbnailClick(): void
{
    thumbnailInputRef.value?.click();
}

function OnRemoveThumbnail(): void
{
    props.data.SetDecorationImage(props.decorationName, null);
    thumbnailUrl.value = null;
}

async function OnThumbnailSelected(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files === null || files.length === 0) return;

    const file = files[0];
    const resized = await ResizeTo100x100(file);
    props.data.SetDecorationImage(props.decorationName, resized);
    LoadThumbnail();
    input.value = '';
}

async function ResizeTo100x100(file: File): Promise<Uint8Array>
{
    return new Promise((resolve, reject) =>
    {
        const img = new Image();
        img.onload = () =>
        {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx === null)
            {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            const scale = Math.min(100 / img.width, 100 / img.height);
            const width = img.width * scale;
            const height = img.height * scale;
            ctx.drawImage(img, (100 - width) / 2, (100 - height) / 2, width, height);
            canvas.toBlob((blob) =>
            {
                if (blob === null)
                {
                    reject(new Error('Canvas toBlob failed'));
                    return;
                }
                blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
            }, 'image/png');
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = URL.createObjectURL(file);
    });
}

function OnUpdateItemField(event: Event, field: 'nameKey' | 'descriptionKey'): void
{
    if (item.value === undefined) return;
    item.value[field] = (event.target as HTMLInputElement).value;
    props.data.SetDecorationItem(props.decorationName, JSON.parse(JSON.stringify(item.value)) as IDecorationItem);
}

const item = computed(() => props.data.GetDecorationItem(props.decorationName));
const category = computed<EMDecorationCategory>({
    get: () => item.value?.category ?? EMDecorationCategory.Plant,
    set: (value: EMDecorationCategory) =>
    {
        if (item.value === undefined) return;
        item.value.category = value;
        props.data.SetDecorationItem(props.decorationName, JSON.parse(JSON.stringify(item.value)) as IDecorationItem);
    }
});
const partList = computed<IDecorationPart[]>(() =>
{
    return [...(item.value?.partList ?? [])].sort((a, b) => a.zIndex - b.zIndex);
});

onMounted(async () =>
{
    if (previewWrapRef.value === null) return;

    app = new Application();
    await app.init({
        width: 480,
        height: 480,
        backgroundAlpha: 0,
        canvas: document.createElement('canvas')
    });
    previewWrapRef.value.appendChild(app.canvas);

    rootContainer = new Container();
    rootContainer.position.set(240, 240);
    app.stage.addChild(rootContainer);

    grid = new Graphics();
    grid.stroke({ width: 1, color: 0x444444, alpha: 0.3 });
    for (let x = 0; x <= 480; x += 20) { grid.moveTo(x - 240, -240); grid.lineTo(x - 240, 240); }
    for (let y = 0; y <= 480; y += 20) { grid.moveTo(-240, y - 240); grid.lineTo(240, y - 240); }
    grid.moveTo(-240, 0); grid.lineTo(240, 0);
    grid.moveTo(0, -240); grid.lineTo(0, 240);
    app.stage.addChildAt(grid, 0);

    await LoadAllSprites();
    app.ticker.add(OnTick);
});

onUnmounted(() =>
{
    app?.destroy(true);
    app = null;
    rootContainer = null;
    grid = null;
    spriteMap.clear();
    textureMap.clear();
    for (const textures of frameTextureMap.values())
    {
        for (const texture of textures)
        {
            texture.destroy();
        }
    }
    frameTextureMap.clear();
    for (const texture of sheetTextureMap.values())
    {
        texture.destroy();
    }
    sheetTextureMap.clear();
});

watch(() => props.decorationName, async () =>
{
    await RebuildScene();
});

watch(() => partList.value.map(p => `${p.id}|${p.zIndex}|${p.sprite}`).join(','), async () =>
{
    await RebuildScene();
});

async function RebuildScene(): Promise<void>
{
    if (rootContainer === null) return;

    for (const sprite of spriteMap.values())
    {
        rootContainer.removeChild(sprite);
        sprite.destroy();
    }
    spriteMap.clear();

    for (const texture of textureMap.values())
    {
        texture.destroy(true);
    }
    textureMap.clear();

    for (const textures of frameTextureMap.values())
    {
        for (const texture of textures)
        {
            texture.destroy();
        }
    }
    frameTextureMap.clear();

    for (const texture of sheetTextureMap.values())
    {
        texture.destroy();
    }
    sheetTextureMap.clear();

    await LoadAllSprites();
}

async function LoadAllSprites(): Promise<void>
{
    if (app === null || rootContainer === null) return;

    for (const part of partList.value)
    {
        const sprite = await CreatePartSprite(part);
        if (sprite !== null)
        {
            spriteMap.set(part.id, sprite);
            rootContainer.addChild(sprite);
        }
    }

    OnTick({ lastTime: 0, deltaMS: 0 });
    FitScene();
}

function FitScene(): void
{
    if (rootContainer === null) return;
    rootContainer.scale.set(1);
    const bounds = rootContainer.getLocalBounds();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const availableSize = 440;
    const scale = Math.min(1, availableSize / bounds.width, availableSize / bounds.height);
    rootContainer.scale.set(scale);
    rootContainer.position.set(
        240 - (bounds.x + bounds.width * 0.5) * scale,
        240 - (bounds.y + bounds.height * 0.5) * scale
    );
}

async function CreatePartSprite(part: IDecorationPart): Promise<Sprite | null>
{
    if (part.animationMode === EMDecorationAnimationMode.Frame)
    {
        return await CreateFramePartSprite(part);
    }
    return await CreateProceduralPartSprite(part);
}

async function CreateProceduralPartSprite(part: IDecorationPart): Promise<Sprite | null>
{
    const data = props.data.GetDecorationSpriteSheet(props.decorationName, part.id);
    if (data === null || data === undefined) return null;

    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);
    const texture = Texture.from(bitmap);
    textureMap.set(part.id, texture);

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    return sprite;
}

async function CreateFramePartSprite(part: IDecorationPart): Promise<Sprite | null>
{
    const frameAnimation = part.frameAnimation;
    const data = props.data.GetDecorationSpriteSheet(props.decorationName, part.id);
    if (frameAnimation === undefined || data === null || data === undefined) return null;

    const sheetTexture = await SpriteSheetUtil.LoadSpriteSheetTexture(data);
    sheetTextureMap.set(part.id, sheetTexture);

    const textures: Texture[] = [];
    for (let i = 0; i < frameAnimation.frameList.length; i++)
    {
        try
        {
            const texture = SpriteSheetUtil.ExtractFrameTexture(sheetTexture, 'idle', i, frameAnimation.frameSize);
            textures.push(texture);
        }
        catch
        {
            // 忽略越界帧
        }
    }

    if (textures.length === 0) return null;

    frameTextureMap.set(part.id, textures);
    const sprite = new Sprite(textures[0]);
    sprite.anchor.set(0.5, 0.5);
    return sprite;
}

function OnTick(ticker: { lastTime: number; deltaMS: number }): void
{
    const time = ticker.lastTime / 1000;

    for (const part of partList.value)
    {
        const sprite = spriteMap.get(part.id);
        if (sprite === undefined) continue;

        if (part.animationMode === EMDecorationAnimationMode.Frame)
        {
            const frameAnimation = part.frameAnimation;
            if (frameAnimation === undefined) continue;
            const textures = frameTextureMap.get(part.id);
            if (textures === undefined || textures.length === 0) continue;
            const frameIndex = Math.floor(time * frameAnimation.fps) % textures.length;
            sprite.texture = textures[frameIndex];
        }
        else
        {
            const transform = ComputeDecorationAnimationTransform(part.tweenAnimation, time);
            sprite.position.set(transform.x + transform.pivotX, transform.y + transform.pivotY);
            sprite.pivot.set(transform.pivotX, transform.pivotY);
            sprite.scale.set(transform.scaleX, transform.scaleY);
            sprite.rotation = transform.rotation;
            sprite.skew.set(0, 0);
        }
    }
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

.previewWrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sumiStudioCore-color-surface-container-highest);
    border-radius: 4px;
}

.basicInfo {
    gap: 8px;
    padding: 0 8px;
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
}

.propRow input {
    flex: 1;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    color: var(--sumiStudioCore-color-surface-on);
}

.thumbnailRow {
    gap: 12px;
    align-items: flex-start;
    padding: 0 8px;
}

.thumbnailLabel {
    width: 100px;
    text-align: right;
    font-size: var(--sumiStudio-font-body-medium-size);
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
    margin-top: 8px;
}

.thumbnailWrap {
    gap: 12px;
}

.avatarBox {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    border: 2px dashed var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color var(--sumiStudio-transition-time-medium);
}

.avatarBox:hover {
    border-color: var(--sumiStudioCore-color-primary);
}

.avatarImg {
    width: 100px;
    height: 100px;
    object-fit: cover;
    display: block;
}

.avatarPlaceholder {
    font-size: var(--sumiStudio-font-body-small-size);
    color: var(--sumiStudioCore-color-surface-on-20);
    text-align: center;
    line-height: 1.4;
}

.thumbnailActions {
    gap: 8px;
}

.thumbnailTip {
    font-size: var(--sumiStudio-font-label-small-size);
    color: var(--sumiStudioCore-color-surface-on-20);
}
</style>
