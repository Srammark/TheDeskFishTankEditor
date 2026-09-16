<template>
    <div class="animationPreview">
        <div class="wR_HC previewHeader">
            <span class="previewTitle">{{ T('page.manageResourcePackage.animationPreview.title') }}</span>
            <div class="wR_HC controls">
                <Button :text="isPlaying ? T('page.manageResourcePackage.animationPreview.pause') : T('page.manageResourcePackage.animationPreview.play')" @click="OnTogglePlay" />
                <label class="showColliderLabel"><input v-model="showColliders" type="checkbox" />{{ T('page.manageResourcePackage.animationPreview.showColliders') }}</label>
            </div>
        </div>
        <div ref="canvasWrapRef" class="canvasWrap"></div>
        <input v-model.number="currentFrame" type="range" :min="0" :max="Math.max(totalFrames - 1, 0)" class="frameSlider" @input="OnSeek" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Application, Sprite, Texture, Graphics, TextureSource } from 'pixi.js';

TextureSource.defaultOptions.scaleMode = 'nearest';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import { EMGeometryType } from '@/Core/Module/Collision2D_DLL/Geometry/GeometryType';
import type { IFrameData, ICreatureCollider, IColliderDataCircle, IColliderDataRectangle, IColliderDataCapsule, IColliderDataEllipse, IColliderDataPie, IColliderDataSegment, IColliderDataPolygon } from '../../Types';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';

const props = defineProps<{
    textures: Texture[];
    fps: number;
    frameDataList: IFrameData[];
    collider: ICreatureCollider;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);

const canvasWrapRef = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let sprite: Sprite | null = null;
let colliderGraphics: Graphics | null = null;

const isPlaying = ref(false);
const showColliders = ref(false);
const currentFrame = ref(0);
const totalFrames = ref(0);
let frameTimer = 0;

onMounted(async () =>
{
    if (canvasWrapRef.value === null) return;
    app = new Application();
    await app.init({
        width: 300,
        height: 300,
        backgroundAlpha: 0,
        canvas: document.createElement('canvas')
    });
    canvasWrapRef.value.appendChild(app.canvas);

    sprite = new Sprite();
    sprite.anchor.set(0.5);
    sprite.x = 150;
    sprite.y = 150;
    app.stage.addChild(sprite);

    colliderGraphics = new Graphics();
    app.stage.addChild(colliderGraphics);

    app.ticker.add(OnTick);
    RefreshFrame();
});

onUnmounted(() =>
{
    app?.destroy(true);
    app = null;
});

watch(() => props.textures, () =>
{
    totalFrames.value = props.textures.length;
    if (currentFrame.value >= totalFrames.value) currentFrame.value = 0;
    RefreshFrame();
}, { immediate: true });

watch(showColliders, RefreshFrame);

function OnTick(ticker: { deltaMS: number }): void
{
    if (!isPlaying.value || props.textures.length === 0) return;
    const interval = 1000 / Math.max(1, props.fps);
    frameTimer += ticker.deltaMS;
    if (frameTimer >= interval)
    {
        frameTimer = 0;
        currentFrame.value = (currentFrame.value + 1) % props.textures.length;
        RefreshFrame();
    }
}

function RefreshFrame(): void
{
    if (sprite === null || colliderGraphics === null) return;
    const texture = props.textures[currentFrame.value];
    if (texture !== undefined)
    {
        sprite.texture = texture;
        const scale = Math.min(300 / texture.width, 300 / texture.height);
        sprite.scale.set(scale);
    }

    colliderGraphics.clear();
    if (showColliders.value)
    {
        const frameData = props.frameDataList[currentFrame.value];
        const s = sprite.scale.x;
        DrawCollider(colliderGraphics, frameData?.colliderOverride.body ?? props.collider.body, 0x00aaff, s);
        DrawCollider(colliderGraphics, frameData?.colliderOverride.mouth ?? props.collider.mouth, 0xff4444, s);
    }
}

const SPRITE_CENTER_X = 150;
const SPRITE_CENTER_Y = 150;

function DrawCollider(g: Graphics, collider: any, color: number, scale: number): void
{
    if (collider === null) return;
    const ox = SPRITE_CENTER_X;
    const oy = SPRITE_CENTER_Y;
    const x = ox + collider.x * scale;
    const y = oy + collider.y * scale;

    g.stroke({ width: 2, color });

    switch (collider.type)
    {
        case EMGeometryType.Circle:
            {
                const c = collider as IColliderDataCircle;
                g.circle(x + c.radius * scale, y + c.radius * scale, c.radius * scale);
            }
            break;
        case EMGeometryType.Rectangle:
            {
                const c = collider as IColliderDataRectangle;
                g.rect(x, y, c.width * scale, c.height * scale);
            }
            break;
        case EMGeometryType.Ellipse:
            {
                const c = collider as IColliderDataEllipse;
                g.ellipse(x + c.width * scale * 0.5, y + c.height * scale * 0.5, c.width * scale * 0.5, c.height * scale * 0.5);
            }
            break;
        case EMGeometryType.Capsule:
            {
                const c = collider as IColliderDataCapsule;
                g.roundRect(x, y, c.length * scale, c.radius * scale * 2, c.radius * scale);
            }
            break;
        case EMGeometryType.Pie:
            {
                const c = collider as IColliderDataPie;
                const startAngle = -c.sweep * 0.5 * (Math.PI / 180);
                const endAngle = c.sweep * 0.5 * (Math.PI / 180);
                g.moveTo(x, y);
                g.arc(x, y, c.radius * scale, startAngle, endAngle);
                g.closePath();
            }
            break;
        case EMGeometryType.Segment:
            {
                const c = collider as IColliderDataSegment;
                const half = c.length * scale * 0.5;
                g.moveTo(x - half, y);
                g.lineTo(x + half, y);
            }
            break;
        case EMGeometryType.Polygon:
            {
                const c = collider as IColliderDataPolygon;
                if (c.vertics.length === 0) break;
                g.moveTo(x + c.vertics[0][0] * scale, y + c.vertics[0][1] * scale);
                for (let i = 1; i < c.vertics.length; i++)
                {
                    g.lineTo(x + c.vertics[i][0] * scale, y + c.vertics[i][1] * scale);
                }
                g.closePath();
            }
            break;
    }

    g.fill({ color, alpha: 0.3 });
}

function OnTogglePlay(): void
{
    isPlaying.value = !isPlaying.value;
}

function OnSeek(): void
{
    isPlaying.value = false;
    RefreshFrame();
}
</script>

<style scoped>
.animationPreview { padding: 16px; border-top: 1px solid var(--sumiStudioCore-color-surface-container-highest); }
.previewHeader { justify-content: space-between; margin-bottom: 8px; }
.previewTitle { font-size: var(--sumiStudio-font-body-medium-size); color: var(--sumiStudioCore-color-surface-on); }
.controls { gap: 12px; }
.showColliderLabel { font-size: 12px; color: var(--sumiStudioCore-color-surface-on); display: flex; align-items: center; gap: 4px; }
.canvasWrap { width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; background: var(--sumiStudioCore-color-surface-container-highest); border-radius: 4px; margin-bottom: 8px; }
.frameSlider { width: 100%; }
</style>
