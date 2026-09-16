<template>
    <div class="wC_HSVS panel">
        <div class="propForm">
            <div class="propRow">
                <label>{{ T('page.manageResourcePackage.decoration.animationMode') }}</label>
                <select :value="animationMode" @change="OnAnimationModeChange">
                    <option :value="EMDecorationAnimationMode.None">{{ T('page.manageResourcePackage.decoration.animationModeNone') }}</option>
                    <option :value="EMDecorationAnimationMode.Tween">{{ T('page.manageResourcePackage.decoration.animationModeTween') }}</option>
                    <option :value="EMDecorationAnimationMode.Frame">{{ T('page.manageResourcePackage.decoration.animationModeFrame') }}</option>
                </select>
            </div>

            <template v-if="animationMode === EMDecorationAnimationMode.Tween">
                <div class="propRow">
                    <label>{{ T('page.manageResourcePackage.decoration.animationType') }}</label>
                    <select :value="animationType" @change="OnAnimationTypeChange">
                        <option v-for="opt in GetDecorationAnimationTypeOptionList()" :key="opt.value" :value="opt.value">{{ opt.text }}</option>
                    </select>
                </div>

                <div v-if="animationType === EMDecorationTweenAnimationType.Sway" class="wC_HSB">
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.amplitude') }}</label>
                        <input v-model.number="swayParams.amplitude" type="number" min="0" @change="OnParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.frequency') }}</label>
                        <input v-model.number="swayParams.frequency" type="number" min="0" step="0.1" @change="OnParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.phase') }}</label>
                        <input v-model.number="swayParams.phase" type="number" min="0" max="1" step="0.1" @change="OnParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.axis') }}</label>
                        <select v-model="swayParams.axis" @change="OnParamsChange">
                            <option value="x">{{ T('page.manageResourcePackage.decoration.axisX') }}</option>
                            <option value="y">{{ T('page.manageResourcePackage.decoration.axisY') }}</option>
                        </select>
                    </div>
                </div>

                <div v-if="animationType === EMDecorationTweenAnimationType.Breathe" class="wC_HSB">
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.minScale') }}</label>
                        <input v-model.number="breatheParams.minScale" type="number" min="0" step="0.1" @change="OnParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.maxScale') }}</label>
                        <input v-model.number="breatheParams.maxScale" type="number" min="0" step="0.1" @change="OnParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.frequency') }}</label>
                        <input v-model.number="breatheParams.frequency" type="number" min="0" step="0.1" @change="OnParamsChange" />
                    </div>
                </div>

                <div v-if="animationType === EMDecorationTweenAnimationType.Rotate" class="wC_HSB">
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.minAngle') }}</label>
                        <input v-model.number="rotateParams.minAngle" type="number" @change="OnParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.maxAngle') }}</label>
                        <input v-model.number="rotateParams.maxAngle" type="number" @change="OnParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.frequency') }}</label>
                        <input v-model.number="rotateParams.frequency" type="number" min="0" step="0.1" @change="OnParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.pivotX') }}</label>
                        <input v-model.number="rotateParams.pivot[0]" type="number" @change="OnParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.pivotY') }}</label>
                        <input v-model.number="rotateParams.pivot[1]" type="number" @change="OnParamsChange" />
                    </div>
                </div>
            </template>

            <template v-if="animationMode === EMDecorationAnimationMode.Frame">
                <div class="wC_HSB">
                    <div class="propRow">
                        <label>FPS</label>
                        <input v-model.number="frameAnimationParams.fps" type="number" min="1" max="120" @change="OnFrameParamsChange" />
                    </div>
                    <div class="propRow">
                        <label>{{ T('page.manageResourcePackage.decoration.frameSize') }}</label>
                        <input v-model.number="frameAnimationParams.frameSize[0]" type="number" min="1" class="sizeInput" @change="OnFrameParamsChange" />
                        <span>×</span>
                        <input v-model.number="frameAnimationParams.frameSize[1]" type="number" min="1" class="sizeInput" @change="OnFrameParamsChange" />
                    </div>
                </div>

                <div class="wR_HC frameActions">
                    <Button :text="T('page.manageResourcePackage.decoration.uploadSheet')" variant="outlined" @click="OnClickUploadSpriteSheet" />
                    <Button :text="T('page.manageResourcePackage.decoration.uploadFrames')" variant="outlined" @click="OnClickUploadFrames" />
                    <Button :text="T('page.manageResourcePackage.decoration.addFrame')" variant="outlined" @click="OnAddFrame" />
                </div>

                <input ref="spriteSheetInputRef" type="file" accept="image/*" style="display: none;" @change="OnSpriteSheetSelected" />
                <input ref="frameInputRef" type="file" accept="image/*" multiple style="display: none;" @change="OnFramesSelected" />

                <div class="frameList">
                    <div
                        v-for="(frame, index) in frameAnimationParams.frameList"
                        :key="`frame-${index}`"
                        class="frameBox"
                        :class="{ active: props.currentFrameIndex === index, empty: !HasFrameImage(index) }"
                        @click="OnSelectFrame(index)"
                    >
                        <SpriteFramePreview v-if="HasFrameImage(index)" :imageUrl="GetFrameImageUrl(index)" :width="40" :height="40" />
                        <span v-else class="framePlaceholder">{{ index + 1 }}</span>
                        <div class="deleteBtn" @click.stop="OnRemoveFrame(index)">×</div>
                    </div>
                </div>
            </template>
        </div>

        <div ref="previewWrapRef" class="previewWrap"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, computed, watch, reactive } from 'vue';
import { Application, Sprite, Texture, Graphics, TextureSource } from 'pixi.js';

TextureSource.defaultOptions.scaleMode = 'nearest';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import SpriteFramePreview from '../../Common/Component/SpriteFramePreview.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import {
    EMDecorationAnimationMode,
    EMDecorationTweenAnimationType, GetDecorationAnimationTypeOptionList,
    type IDecorationPart, type IDecorationTweenAnimation,
    type IDecorationTweenAnimationSway, type IDecorationTweenAnimationBreathe, type IDecorationTweenAnimationRotate,
    type IDecorationFrameAnimation, type IDecorationFrameData,
    ComputeDecorationAnimationTransform
} from '../../Types';
import * as SpriteSheetUtil from '../../SpriteSheetUtil';

const props = defineProps<{
    data: IResourcePackageData;
    decorationName: string;
    part: IDecorationPart;
    currentFrameIndex?: number;
}>();

const emit = defineEmits<{
    (e: 'update', patch: Partial<IDecorationPart>): void;
    (e: 'selectFrame', index: number): void;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);

const previewWrapRef = ref<HTMLDivElement | null>(null);
const spriteSheetInputRef = ref<HTMLInputElement | null>(null);
const frameInputRef = ref<HTMLInputElement | null>(null);
let app: Application | null = null;
let sprite: Sprite | null = null;
let placeholder: Graphics | null = null;
let previewScale = 1;

const animationMode = computed<EMDecorationAnimationMode>(() => props.part.animationMode ?? EMDecorationAnimationMode.Tween);
const animationType = computed<EMDecorationTweenAnimationType>(() => props.part.tweenAnimation?.type ?? EMDecorationTweenAnimationType.None);
const spriteSheetData = computed<Uint8Array | null | undefined>(() => props.data.GetDecorationSpriteSheet(props.decorationName, props.part.id));

const defaultSway: IDecorationTweenAnimationSway = {
    type: EMDecorationTweenAnimationType.Sway,
    amplitude: 10,
    frequency: 1,
    phase: 0,
    axis: 'x'
};

const defaultBreathe: IDecorationTweenAnimationBreathe = {
    type: EMDecorationTweenAnimationType.Breathe,
    minScale: 0.9,
    maxScale: 1.1,
    frequency: 1
};

const defaultRotate: IDecorationTweenAnimationRotate = {
    type: EMDecorationTweenAnimationType.Rotate,
    minAngle: -15,
    maxAngle: 15,
    frequency: 1,
    pivot: [0, 0]
};

const swayParams = ref<IDecorationTweenAnimationSway>(GetSwayParams());
const breatheParams = ref<IDecorationTweenAnimationBreathe>(GetBreatheParams());
const rotateParams = ref<IDecorationTweenAnimationRotate>(GetRotateParams());
const frameAnimationParams = reactive<IDecorationFrameAnimation>(GetFrameAnimationParams());

const frameTextureList = shallowRef<Texture[]>([]);
const frameImageUrlList = shallowRef<string[]>([]);
let sheetTexture: Texture | null = null;

watch(() => props.part.tweenAnimation, () =>
{
    swayParams.value = GetSwayParams();
    breatheParams.value = GetBreatheParams();
    rotateParams.value = GetRotateParams();
});

watch(() => props.part.frameAnimation, () =>
{
    const config = GetFrameAnimationParams();
    frameAnimationParams.fps = config.fps;
    frameAnimationParams.frameSize = config.frameSize;
    frameAnimationParams.frameList = config.frameList;
});

function GetSwayParams(): IDecorationTweenAnimationSway
{
    if (props.part.tweenAnimation?.type === EMDecorationTweenAnimationType.Sway) return JSON.parse(JSON.stringify(props.part.tweenAnimation)) as IDecorationTweenAnimationSway;
    return { ...defaultSway };
}

function GetBreatheParams(): IDecorationTweenAnimationBreathe
{
    if (props.part.tweenAnimation?.type === EMDecorationTweenAnimationType.Breathe) return JSON.parse(JSON.stringify(props.part.tweenAnimation)) as IDecorationTweenAnimationBreathe;
    return { ...defaultBreathe };
}

function GetRotateParams(): IDecorationTweenAnimationRotate
{
    if (props.part.tweenAnimation?.type === EMDecorationTweenAnimationType.Rotate) return JSON.parse(JSON.stringify(props.part.tweenAnimation)) as IDecorationTweenAnimationRotate;
    return { ...defaultRotate };
}

function GetFrameAnimationParams(): IDecorationFrameAnimation
{
    const config = props.part.frameAnimation;
    if (config !== undefined)
    {
        return JSON.parse(JSON.stringify(config)) as IDecorationFrameAnimation;
    }
    return { fps: 8, frameSize: [64, 64], frameList: [] };
}

onMounted(async () =>
{
    if (previewWrapRef.value === null) return;

    app = new Application();
    await app.init({
        width: 360,
        height: 360,
        backgroundAlpha: 0,
        canvas: document.createElement('canvas')
    });
    previewWrapRef.value.appendChild(app.canvas);

    const grid = new Graphics();
    grid.stroke({ width: 1, color: 0x444444, alpha: 0.3 });
    for (let x = 0; x <= 360; x += 20) { grid.moveTo(x, 0); grid.lineTo(x, 360); }
    for (let y = 0; y <= 360; y += 20) { grid.moveTo(0, y); grid.lineTo(360, y); }
    app.stage.addChild(grid);

    placeholder = new Graphics();
    placeholder.rect(-32, -32, 64, 64);
    placeholder.fill({ color: 0x888888, alpha: 0.3 });
    placeholder.stroke({ width: 1, color: 0x888888 });
    app.stage.addChild(placeholder);

    await RebuildPreview();
    app.ticker.add(OnTick);
});

onUnmounted(() =>
{
    app?.destroy(true);
    app = null;
    sprite = null;
    placeholder = null;
    CleanupFrameTextures();
});

watch(() => [props.part.id, animationMode.value], async () =>
{
    swayParams.value = GetSwayParams();
    breatheParams.value = GetBreatheParams();
    rotateParams.value = GetRotateParams();
    const config = GetFrameAnimationParams();
    frameAnimationParams.fps = config.fps;
    frameAnimationParams.frameSize = config.frameSize;
    frameAnimationParams.frameList = config.frameList;
    await RebuildPreview();
});

watch(() => spriteSheetData.value, async () =>
{
    await RebuildPreview();
});

function CleanupFrameTextures(): void
{
    for (const texture of frameTextureList.value)
    {
        texture.destroy();
    }
    frameTextureList.value = [];
    for (const url of frameImageUrlList.value)
    {
        URL.revokeObjectURL(url);
    }
    frameImageUrlList.value = [];
    sheetTexture?.destroy();
    sheetTexture = null;
}

function CleanupSprite(): void
{
    if (sprite !== null)
    {
        app?.stage.removeChild(sprite);
        sprite.destroy();
        sprite = null;
    }
}

async function RebuildPreview(): Promise<void>
{
    if (app === null) return;
    CleanupSprite();
    CleanupFrameTextures();

    if (animationMode.value === EMDecorationAnimationMode.None || animationMode.value === EMDecorationAnimationMode.Tween)
    {
        await LoadProceduralSprite();
    }
    else
    {
        await LoadFrameSprite();
    }
}

async function LoadProceduralSprite(): Promise<void>
{
    const data = spriteSheetData.value;
    if (data === null || data === undefined)
    {
        if (placeholder !== null) placeholder.visible = true;
        return;
    }

    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);
    const texture = Texture.from(bitmap);
    sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(180, 180);
    UpdatePreviewScale();
    app?.stage.addChild(sprite);
    if (placeholder !== null) placeholder.visible = false;
}

async function LoadFrameSprite(): Promise<void>
{
    const data = spriteSheetData.value;
    if (data === null || data === undefined || frameAnimationParams.frameList.length === 0)
    {
        if (placeholder !== null) placeholder.visible = true;
        return;
    }

    sheetTexture = await SpriteSheetUtil.LoadSpriteSheetTexture(data);

    const [fw, fh] = [frameAnimationParams.frameSize[0], frameAnimationParams.frameSize[1]];
    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);

    for (let i = 0; i < frameAnimationParams.frameList.length; i++)
    {
        try
        {
            const texture = SpriteSheetUtil.ExtractFrameTexture(sheetTexture, 'idle', i, [fw, fh]);
            frameTextureList.value.push(texture);

            const canvas = document.createElement('canvas');
            canvas.width = fw;
            canvas.height = fh;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(bitmap, i * fw, 0, fw, fh, 0, 0, fw, fh);
            const frameBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b ?? null), 'image/png'));
            if (frameBlob !== null)
            {
                frameImageUrlList.value.push(URL.createObjectURL(frameBlob));
            }
            else
            {
                frameImageUrlList.value.push('');
            }
        }
        catch
        {
            // 忽略越界帧
            frameImageUrlList.value.push('');
        }
    }

    if (frameTextureList.value.length === 0)
    {
        if (placeholder !== null) placeholder.visible = true;
        return;
    }

    sprite = new Sprite(frameTextureList.value[0]!);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(180, 180);
    UpdatePreviewScale();
    app?.stage.addChild(sprite);
    if (placeholder !== null) placeholder.visible = false;
}

function UpdatePreviewScale(): void
{
    if (sprite === null) return;
    const width = Math.max(1, sprite.texture.width);
    const height = Math.max(1, sprite.texture.height);
    previewScale = Math.min(1, 320 / width, 320 / height);
    sprite.scale.set(previewScale);
}

function OnTick(ticker: { lastTime: number; deltaMS: number }): void
{
    if (sprite === null) return;

    if (animationMode.value === EMDecorationAnimationMode.None) return;

    if (animationMode.value === EMDecorationAnimationMode.Tween)
    {
        const t = ticker.lastTime / 1000;
        const transform = ComputeDecorationAnimationTransform(props.part.tweenAnimation, t);

        sprite.position.set(180 + (transform.x + transform.pivotX) * previewScale, 180 + (transform.y + transform.pivotY) * previewScale);
        sprite.pivot.set(transform.pivotX, transform.pivotY);
        sprite.scale.set(transform.scaleX * previewScale, transform.scaleY * previewScale);
        sprite.rotation = transform.rotation;
        sprite.skew.set(0, 0);
    }
    else
    {
        if (frameAnimationParams.frameList.length === 0 || frameTextureList.value.length === 0) return;
        const frameIndex = Math.floor(ticker.lastTime / 1000 * frameAnimationParams.fps) % frameAnimationParams.frameList.length;
        const texture = frameTextureList.value[frameIndex];
        if (texture !== undefined)
        {
            sprite.texture = texture;
            UpdatePreviewScale();
        }
    }
}

function OnAnimationModeChange(event: Event): void
{
    const target = event.target as HTMLSelectElement;
    const mode = target.value as EMDecorationAnimationMode;
    const patch: Partial<IDecorationPart> = { animationMode: mode };
    if (mode === EMDecorationAnimationMode.Frame && props.part.frameAnimation === undefined)
    {
        patch.frameAnimation = { fps: 8, frameSize: [64, 64], frameList: [] };
    }
    emit('update', patch);
}

function OnAnimationTypeChange(event: Event): void
{
    const target = event.target as HTMLSelectElement;
    const type = target.value as EMDecorationTweenAnimationType;
    EmitAnimation(type);
}

function OnParamsChange(): void
{
    EmitAnimation(animationType.value);
}

function EmitAnimation(type: EMDecorationTweenAnimationType): void
{
    let animation: IDecorationTweenAnimation | undefined;
    switch (type)
    {
        case EMDecorationTweenAnimationType.Sway:
            animation = JSON.parse(JSON.stringify(swayParams.value)) as IDecorationTweenAnimationSway;
            break;
        case EMDecorationTweenAnimationType.Breathe:
            animation = JSON.parse(JSON.stringify(breatheParams.value)) as IDecorationTweenAnimationBreathe;
            break;
        case EMDecorationTweenAnimationType.Rotate:
            animation = JSON.parse(JSON.stringify(rotateParams.value)) as IDecorationTweenAnimationRotate;
            break;
        default:
            animation = undefined;
    }
    emit('update', { tweenAnimation: animation });
}

function OnFrameParamsChange(): void
{
    EmitFrameAnimation();
}

function EmitFrameAnimation(): void
{
    const config = JSON.parse(JSON.stringify(frameAnimationParams)) as IDecorationFrameAnimation;
    emit('update', { frameAnimation: config });
}

function CreateEmptyFrameData(): IDecorationFrameData
{
    return {
        colliderOverrideList: [],
        areaOverrideList: []
    };
}

function GenerateID(): string
{
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function OnAddFrame(): void
{
    frameAnimationParams.frameList.push(CreateEmptyFrameData());
    EmitFrameAnimation();
}

function OnRemoveFrame(index: number): void
{
    frameAnimationParams.frameList.splice(index, 1);
    EmitFrameAnimation();
}

function OnSelectFrame(index: number): void
{
    emit('selectFrame', index);
}

function HasFrameImage(index: number): boolean
{
    const url = frameImageUrlList.value[index];
    return url !== undefined && url !== '';
}

function GetFrameImageUrl(index: number): string | null
{
    const url = frameImageUrlList.value[index];
    return url !== undefined && url !== '' ? url : null;
}

function OnClickUploadSpriteSheet(): void
{
    spriteSheetInputRef.value?.click();
}

function OnClickUploadFrames(): void
{
    frameInputRef.value?.click();
}

async function OnSpriteSheetSelected(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file === undefined) return;

    const buffer = new Uint8Array(await file.arrayBuffer());
    const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);

    const [fw, fh] = frameAnimationParams.frameSize;
    const frameCount = Math.floor(bitmap.width / fw);

    while (frameAnimationParams.frameList.length < frameCount)
    {
        const frameData = CreateEmptyFrameData();
        frameAnimationParams.frameList.push(frameData);
    }
    while (frameAnimationParams.frameList.length > frameCount)
    {
        frameAnimationParams.frameList.pop();
    }

    // 图像已更换，旧帧级碰撞体覆盖的 colliderID 将随 part 级重建而失效
    for (const frameData of frameAnimationParams.frameList)
    {
        frameData.colliderOverrideList = [];
    }

    // 逐帧生成碰撞体：第 1 帧写入 part 级基础配置，其余帧与第 1 帧有差距才写入帧级覆盖
    let baseColliderId: string | null = null;
    let baseColliderJson: string | null = null;
    for (let i = 0; i < frameCount; i++)
    {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = fw;
        frameCanvas.height = fh;
        const ctx = frameCanvas.getContext('2d');
        if (ctx !== null)
        {
            ctx.drawImage(bitmap, i * fw, 0, fw, fh, 0, 0, fw, fh);
            const frameBlob = await new Promise<Blob | null>((resolve) => frameCanvas.toBlob((b) => resolve(b ?? null), 'image/png'));
            if (frameBlob !== null)
            {
                const frameBuf = new Uint8Array(await frameBlob.arrayBuffer());
                const collider = await SpriteSheetUtil.GenerateDefaultCollider(frameBuf, [fw, fh]);
                if (collider !== null)
                {
                    if (i === 0)
                    {
                        baseColliderId = GenerateID();
                        props.part.colliderList = [{ id: baseColliderId, collider }];
                        baseColliderJson = JSON.stringify(collider);
                    }
                    else if (baseColliderId !== null && JSON.stringify(collider) !== baseColliderJson)
                    {
                        frameAnimationParams.frameList[i].colliderOverrideList = [{ colliderID: baseColliderId, collider }];
                    }
                }
            }
        }
    }

    props.data.SetDecorationSpriteSheet(props.decorationName, props.part.id, buffer);
    props.part.sprite = `${props.part.id}.png`;
    EmitFrameAnimation();
    await RebuildPreview();
}

async function OnFramesSelected(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const files = input.files;
    input.value = '';
    if (files === null || files.length === 0) return;

    const sorted = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
    const frameDataList: Uint8Array[] = [];
    for (const file of sorted)
    {
        frameDataList.push(new Uint8Array(await file.arrayBuffer()));
    }

    const firstBlob = new Blob([frameDataList[0].buffer as ArrayBuffer], { type: 'image/png' });
    const firstBitmap = await createImageBitmap(firstBlob);
    frameAnimationParams.frameSize = [firstBitmap.width, firstBitmap.height];

    frameAnimationParams.frameList = [];
    for (let i = 0; i < frameDataList.length; i++)
    {
        frameAnimationParams.frameList.push(CreateEmptyFrameData());
    }

    // 逐帧生成碰撞体：第 1 帧写入 part 级基础配置，其余帧与第 1 帧有差距才写入帧级覆盖
    let baseColliderId: string | null = null;
    let baseColliderJson: string | null = null;
    for (let i = 0; i < frameDataList.length; i++)
    {
        const collider = await SpriteSheetUtil.GenerateDefaultCollider(frameDataList[i], frameAnimationParams.frameSize);
        if (collider === null) continue;
        if (i === 0)
        {
            baseColliderId = GenerateID();
            props.part.colliderList = [{ id: baseColliderId, collider }];
            baseColliderJson = JSON.stringify(collider);
        }
        else if (baseColliderId !== null && JSON.stringify(collider) !== baseColliderJson)
        {
            frameAnimationParams.frameList[i].colliderOverrideList = [{ colliderID: baseColliderId, collider }];
        }
    }

    const frames: Record<'idle' | 'swim' | 'eat', (Uint8Array | null)[]> = {
        idle: frameDataList,
        swim: [],
        eat: []
    };
    const sheet = await SpriteSheetUtil.BuildSpriteSheet(frames, frameAnimationParams.frameSize);
    props.data.SetDecorationSpriteSheet(props.decorationName, props.part.id, sheet);
    props.part.sprite = `${props.part.id}.png`;
    EmitFrameAnimation();
    await RebuildPreview();
}
</script>

<style scoped>
.panel {
    flex: 1;
    overflow: hidden;
    gap: 12px;
}

.propForm {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

.propRow input,
.propRow select {
    flex: 1;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    color: var(--sumiStudioCore-color-surface-on);
}

.sizeInput {
    flex: none !important;
    width: 56px;
}

.frameActions {
    gap: 8px;
}

.frameList {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.frameBox {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sumiStudioCore-color-surface-container);
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.frameBox.active {
    background: var(--sumiStudioCore-color-primary-container);
}

.frameBox.empty {
    border: 1px dashed var(--sumiStudioCore-color-surface-variant-on);
}

.framePlaceholder {
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-20);
}

.deleteBtn {
    position: absolute;
    top: 0;
    right: 0;
    width: 14px;
    height: 14px;
    line-height: 14px;
    text-align: center;
    font-size: 12px;
    color: var(--sumiStudioCore-color-error);
    cursor: pointer;
}

.previewWrap {
    flex: 1;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sumiStudioCore-color-surface-container-highest);
    border-radius: 4px;
}
</style>
