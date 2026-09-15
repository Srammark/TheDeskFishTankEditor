<template>
    <div class="shapeEditorRoot">
        <div ref="canvasWrapRef" class="canvasWrap"></div>
        <div class="propPanel">
            <div v-if="currentCollider" class="propForm">
                <div class="propRow">
                    <label>形状</label>
                    <select v-model="currentCollider.type" @change="OnShapeChange">
                        <option :value="EMGeometryType.Circle">圆形</option>
                        <option :value="EMGeometryType.Rectangle">矩形</option>
                        <option :value="EMGeometryType.Capsule">胶囊</option>
                        <option :value="EMGeometryType.Ellipse">椭圆</option>
                        <option :value="EMGeometryType.Polygon">多边形</option>
                        <option :value="EMGeometryType.Pie">扇形</option>
                        <option :value="EMGeometryType.Segment">线段</option>
                    </select>
                </div>
                <div class="propRow">
                    <label>X</label>
                    <input v-model.number="currentCollider.x" type="number" @input="OnPropChange" />
                </div>
                <div class="propRow">
                    <label>Y</label>
                    <input v-model.number="currentCollider.y" type="number" @input="OnPropChange" />
                </div>
                <template v-if="currentCollider.type === EMGeometryType.Circle">
                    <div class="propRow"><label>半径</label><input v-model.number="circleCollider.radius" type="number" min="0" @input="OnPropChange" /></div>
                </template>
                <template v-if="currentCollider.type === EMGeometryType.Rectangle || currentCollider.type === EMGeometryType.Ellipse">
                    <div class="propRow"><label>宽度</label><input v-model.number="rectCollider.width" type="number" min="0" @input="OnPropChange" /></div>
                    <div class="propRow"><label>高度</label><input v-model.number="rectCollider.height" type="number" min="0" @input="OnPropChange" /></div>
                </template>
                <template v-if="currentCollider.type === EMGeometryType.Capsule">
                    <div class="propRow"><label>长度</label><input v-model.number="capsuleCollider.length" type="number" min="0" @input="OnPropChange" /></div>
                    <div class="propRow"><label>半径</label><input v-model.number="capsuleCollider.radius" type="number" min="0" @input="OnPropChange" /></div>
                </template>
                <template v-if="currentCollider.type === EMGeometryType.Pie">
                    <div class="propRow"><label>半径</label><input v-model.number="pieCollider.radius" type="number" min="0" @input="OnPropChange" /></div>
                    <div class="propRow"><label>扫掠角</label><input v-model.number="pieCollider.sweep" type="number" min="0" max="360" @input="OnPropChange" /></div>
                </template>
                <template v-if="currentCollider.type === EMGeometryType.Segment">
                    <div class="propRow"><label>长度</label><input v-model.number="segmentCollider.length" type="number" min="0" @input="OnPropChange" /></div>
                </template>
                <template v-if="currentCollider.type === EMGeometryType.Polygon">
                    <div class="vertexPanel">
                        <div class="vertexHeader">
                            <label>顶点</label>
                            <span class="vertexHint">左键拖拽 / 右键删除 / 点击边添加</span>
                        </div>
                        <div v-for="(v, i) in polygonCollider.vertics" :key="i" class="vertexRow">
                            <span class="vertexIndex">{{ i }}</span>
                            <input v-model.number="v[0]" type="number" class="vertexInput" @input="OnVertexInputChange" />
                            <input v-model.number="v[1]" type="number" class="vertexInput" @input="OnVertexInputChange" />
                            <span class="vertexDelete" @click="OnDeleteVertex(i)">×</span>
                        </div>
                        <Button text="添加顶点" variant="outlined" @click="OnAddVertex" />
                    </div>
                </template>
            </div>
            <div v-else class="propForm">
                <span style="font-size: 12px; color: var(--sumiStudioCore-color-surface-on-20);">当前无形状</span>
            </div>
            <div class="wR_HC toolRow">
                <Button v-if="currentCollider" text="删除" variant="outlined" @click="OnDeleteShape" />
                <Button v-else text="创建" variant="outlined" @click="OnCreateShape" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { Application, Sprite, Texture, Graphics, Container, Point, TextureSource } from 'pixi.js';

TextureSource.defaultOptions.scaleMode = 'nearest';
import { EMGeometryType } from '@/Core/Module/Collision2D_DLL/Geometry/GeometryType';
import type {
    IColliderData,
    IColliderDataCircle, IColliderDataRectangle, IColliderDataCapsule,
    IColliderDataEllipse, IColliderDataPie, IColliderDataSegment,
    IColliderDataPolygon
} from '../../Types';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';

export interface IShapeEditorViewport
{
    /** 画布像素宽度 */
    width: number;
    /** 画布像素高度 */
    height: number;
    /** 逻辑原点 X */
    originX: number;
    /** 逻辑原点 Y */
    originY: number;
    /** 逻辑像素缩放比 */
    scale: number;
}

export interface IShapeEditorTransform
{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    pivotX: number;
    pivotY: number;
}

const props = defineProps<{
    texture?: Texture | null;
    viewport: IShapeEditorViewport;
    shape?: IColliderData | null;
    shapeList?: IColliderData[];
    selectedIndex?: number;
    color?: number;
    shapeColorList?: number[];
    animationTransform?: IShapeEditorTransform | null;
}>();

const emit = defineEmits<{
    (e: 'update:shape', shape: IColliderData | null): void;
    (e: 'update:shapeList', shapeList: IColliderData[]): void;
    (e: 'select', index: number): void;
}>();

const isMultiMode = computed<boolean>(() => props.shapeList !== undefined);

const canvasWrapRef = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let previewRoot: Container | null = null;
let sprite: Sprite | null = null;
let shapeGraphics: Graphics | null = null;
let handleGraphics: Graphics | null = null;
let vertexHandleGraphics: Graphics | null = null;

const VERTEX_HANDLE_OUTER_RADIUS = 4;
const VERTEX_HANDLE_INNER_RADIUS = 2;

let isDragging = false;
let isScaling = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartLocalX = 0;
let dragStartLocalY = 0;
let colliderStartX = 0;
let colliderStartY = 0;
let colliderStartParamW = 0;
let colliderStartParamH = 0;
let dragVertexIndex: number | null = null;
let dragVertexStartX = 0;
let dragVertexStartY = 0;

const localShape = ref<IColliderData | null>(JSON.parse(JSON.stringify(props.shape ?? null)) as IColliderData | null);
const localShapeList = ref<IColliderData[]>(JSON.parse(JSON.stringify(props.shapeList ?? [])) as IColliderData[]);

watch(() => props.shape, (v) =>
{
    if (isMultiMode.value) return;
    localShape.value = JSON.parse(JSON.stringify(v ?? null)) as IColliderData | null;
    RefreshGraphics();
});

watch(() => props.shapeList, (v) =>
{
    if (!isMultiMode.value) return;
    localShapeList.value = JSON.parse(JSON.stringify(v ?? [])) as IColliderData[];
    RefreshGraphics();
});

watch(() => props.selectedIndex, () =>
{
    RefreshGraphics();
});

watch(() => props.animationTransform, () =>
{
    ApplyAnimationTransform();
});

const selectedIndexLocal = computed<number>(() => props.selectedIndex ?? -1);

const currentCollider = computed<IColliderData | null>(() =>
{
    if (isMultiMode.value)
    {
        const list = localShapeList.value;
        const idx = selectedIndexLocal.value;
        return idx >= 0 && idx < list.length ? list[idx] : null;
    }
    return localShape.value;
});

const circleCollider = computed(() => currentCollider.value as unknown as IColliderDataCircle);
const rectCollider = computed(() => currentCollider.value as unknown as IColliderDataRectangle);
const capsuleCollider = computed(() => currentCollider.value as unknown as IColliderDataCapsule);
const pieCollider = computed(() => currentCollider.value as unknown as IColliderDataPie);
const segmentCollider = computed(() => currentCollider.value as unknown as IColliderDataSegment);
const polygonCollider = computed(() => currentCollider.value as unknown as IColliderDataPolygon);

const shapeColor = computed(() => props.color ?? 0x00aaff);

watch(() => props.texture, () =>
{
    if (sprite !== null)
    {
        sprite.texture = props.texture ?? Texture.EMPTY;
        sprite.scale.set(GetScale());
        sprite.visible = props.texture !== null && props.texture !== undefined;
    }
    ApplyAnimationTransform();
    RefreshGraphics();
});

watch(() => props.viewport, () =>
{
    sprite?.scale.set(GetScale());
    ApplyAnimationTransform();
    RefreshGraphics();
});

onMounted(async () =>
{
    if (canvasWrapRef.value === null) return;
    const { width, height } = props.viewport;

    app = new Application();
    await app.init({
        width,
        height,
        backgroundAlpha: 0,
        canvas: document.createElement('canvas')
    });
    canvasWrapRef.value.appendChild(app.canvas);

    const grid = new Graphics();
    grid.stroke({ width: 1, color: 0x444444, alpha: 0.3 });
    for (let x = 0; x <= width; x += 20) { grid.moveTo(x, 0); grid.lineTo(x, height); }
    for (let y = 0; y <= height; y += 20) { grid.moveTo(0, y); grid.lineTo(width, y); }
    app.stage.addChild(grid);

    previewRoot = new Container();
    previewRoot.position.set(props.viewport.originX, props.viewport.originY);
    app.stage.addChild(previewRoot);

    const s = GetScale();
    sprite = new Sprite(props.texture ?? Texture.EMPTY);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(0, 0);
    sprite.scale.set(s);
    sprite.visible = props.texture !== null && props.texture !== undefined;
    previewRoot.addChild(sprite);

    shapeGraphics = new Graphics();
    shapeGraphics.eventMode = 'static';
    shapeGraphics.cursor = 'pointer';
    shapeGraphics.on('pointerdown', OnShapeDown);
    app.stage.addChild(shapeGraphics);

    handleGraphics = new Graphics();
    handleGraphics.eventMode = 'static';
    handleGraphics.cursor = 'nwse-resize';
    handleGraphics.on('pointerdown', OnHandleDown);
    app.stage.addChild(handleGraphics);

    vertexHandleGraphics = new Graphics();
    app.stage.addChild(vertexHandleGraphics);

    app.stage.eventMode = 'static';
    app.stage.on('pointermove', OnStageMove);
    app.stage.on('pointerup', OnStageUp);
    app.stage.on('pointerupoutside', OnStageUp);
    app.stage.on('pointerdown', OnStageDown);
    app.canvas.addEventListener('contextmenu', OnContextMenu);

    ApplyAnimationTransform();
    RefreshGraphics();
});

onUnmounted(() =>
{
    app?.canvas.removeEventListener('contextmenu', OnContextMenu);
    app?.destroy(true);
    app = null;
    previewRoot = null;
    sprite = null;
    shapeGraphics = null;
    handleGraphics = null;
    vertexHandleGraphics = null;
});

function GetScale(): number
{
    return props.viewport.scale;
}

function ApplyAnimationTransform(): void
{
    if (previewRoot === null || app === null) return;

    const transform = props.animationTransform;
    if (transform === undefined || transform === null)
    {
        previewRoot.position.set(props.viewport.originX, props.viewport.originY);
        previewRoot.scale.set(1, 1);
        previewRoot.rotation = 0;
        previewRoot.pivot.set(0, 0);
        return;
    }

    previewRoot.position.set(props.viewport.originX + transform.x, props.viewport.originY + transform.y);
    previewRoot.pivot.set(transform.pivotX, transform.pivotY);
    previewRoot.scale.set(transform.scaleX, transform.scaleY);
    previewRoot.rotation = transform.rotation;
}

function RefreshGraphics(): void
{
    if (shapeGraphics === null || handleGraphics === null || vertexHandleGraphics === null) return;
    const scale = GetScale();

    shapeGraphics.clear();
    if (isMultiMode.value)
    {
        const list = localShapeList.value;
        const colors = props.shapeColorList;
        for (let i = 0; i < list.length; i++)
        {
            const isSelected = i === selectedIndexLocal.value;
            DrawCollider(shapeGraphics, list[i], scale, isSelected, colors?.[i] ?? shapeColor.value, isSelected ? 0.5 : 0.25);
        }
    }
    else if (localShape.value !== null)
    {
        DrawCollider(shapeGraphics, localShape.value, scale, true);
    }

    handleGraphics.clear();
    const collider = currentCollider.value;
    if (collider !== null && collider.type !== EMGeometryType.Polygon)
    {
        const hx = props.viewport.originX + (collider.x + GetColliderWidth(collider)) * scale - 4;
        const hy = props.viewport.originY + (collider.y + GetColliderHeight(collider)) * scale - 4;
        handleGraphics.rect(hx, hy, 8, 8);
        handleGraphics.fill({ color: 0xffffff });
        handleGraphics.stroke({ width: 1, color: 0x000000 });
        handleGraphics.visible = true;
    }
    else
    {
        handleGraphics.visible = false;
    }

    vertexHandleGraphics.clear();
    DrawPolygonVertexHandles(scale);
}

function DrawCollider(g: Graphics, collider: IColliderData, scale: number, isSelected: boolean, colorOverride?: number, alphaOverride?: number): void
{
    const color = colorOverride ?? shapeColor.value;
    const alpha = alphaOverride ?? (isSelected ? 0.5 : 0.25);
    const ox = props.viewport.originX;
    const oy = props.viewport.originY;
    const x = ox + collider.x * scale;
    const y = oy + collider.y * scale;

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
                g.stroke({ width: isSelected ? 3 : 2, color });
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

    if (collider.type !== EMGeometryType.Segment)
    {
        g.fill({ color, alpha });
        g.stroke({ width: isSelected ? 2 : 1, color });
    }
}

function GetColliderWidth(collider: IColliderData): number
{
    switch (collider.type)
    {
        case EMGeometryType.Circle: return (collider as IColliderDataCircle).radius * 2;
        case EMGeometryType.Rectangle:
        case EMGeometryType.Ellipse: return (collider as IColliderDataRectangle).width;
        case EMGeometryType.Capsule: return (collider as IColliderDataCapsule).length;
        case EMGeometryType.Pie: return (collider as IColliderDataPie).radius * 2;
        case EMGeometryType.Segment: return (collider as IColliderDataSegment).length;
        case EMGeometryType.Polygon:
            {
                const c = collider as IColliderDataPolygon;
                if (c.vertics.length === 0) return 0;
                let minX = c.vertics[0][0];
                let maxX = c.vertics[0][0];
                for (const v of c.vertics)
                {
                    minX = Math.min(minX, v[0]);
                    maxX = Math.max(maxX, v[0]);
                }
                return maxX - minX;
            }
    }
    return 0;
}

function GetColliderHeight(collider: IColliderData): number
{
    switch (collider.type)
    {
        case EMGeometryType.Circle: return (collider as IColliderDataCircle).radius * 2;
        case EMGeometryType.Rectangle:
        case EMGeometryType.Ellipse: return (collider as IColliderDataRectangle).height;
        case EMGeometryType.Capsule: return (collider as IColliderDataCapsule).radius * 2;
        case EMGeometryType.Pie: return (collider as IColliderDataPie).radius * 2;
        case EMGeometryType.Segment: return 2;
        case EMGeometryType.Polygon:
            {
                const c = collider as IColliderDataPolygon;
                if (c.vertics.length === 0) return 0;
                let minY = c.vertics[0][1];
                let maxY = c.vertics[0][1];
                for (const v of c.vertics)
                {
                    minY = Math.min(minY, v[1]);
                    maxY = Math.max(maxY, v[1]);
                }
                return maxY - minY;
            }
    }
    return 0;
}

function GetPolygonBounds(collider: IColliderDataPolygon): { minX: number; minY: number; maxX: number; maxY: number }
{
    if (collider.vertics.length === 0)
    {
        return { minX: collider.x, minY: collider.y, maxX: collider.x, maxY: collider.y };
    }
    let minX = collider.vertics[0][0];
    let minY = collider.vertics[0][1];
    let maxX = collider.vertics[0][0];
    let maxY = collider.vertics[0][1];
    for (const v of collider.vertics)
    {
        minX = Math.min(minX, v[0]);
        minY = Math.min(minY, v[1]);
        maxX = Math.max(maxX, v[0]);
        maxY = Math.max(maxY, v[1]);
    }
    return { minX, minY, maxX, maxY };
}

function OnShapeChange(): void
{
    const type = currentCollider.value?.type ?? EMGeometryType.Rectangle;
    let newCollider: IColliderData;
    switch (type)
    {
        case EMGeometryType.Circle:
            newCollider = { type: EMGeometryType.Circle, x: 10, y: 10, radius: 10 };
            break;
        case EMGeometryType.Rectangle:
            newCollider = { type: EMGeometryType.Rectangle, x: 10, y: 10, width: 20, height: 20 };
            break;
        case EMGeometryType.Capsule:
            newCollider = { type: EMGeometryType.Capsule, x: 10, y: 10, length: 20, radius: 5 };
            break;
        case EMGeometryType.Ellipse:
            newCollider = { type: EMGeometryType.Ellipse, x: 10, y: 10, width: 20, height: 15 };
            break;
        case EMGeometryType.Pie:
            newCollider = { type: EMGeometryType.Pie, x: 10, y: 10, radius: 15, sweep: 60 };
            break;
        case EMGeometryType.Segment:
            newCollider = { type: EMGeometryType.Segment, x: 10, y: 10, length: 20, normal: [0, 1] };
            break;
        case EMGeometryType.Polygon:
            newCollider = { type: EMGeometryType.Polygon, x: 10, y: 10, vertics: [[0, 0], [20, 0], [20, 20], [0, 20]] };
            break;
        default:
            newCollider = { type: EMGeometryType.Rectangle, x: 10, y: 10, width: 20, height: 20 };
    }

    if (isMultiMode.value)
    {
        const list = localShapeList.value;
        const idx = selectedIndexLocal.value;
        if (idx >= 0 && idx < list.length)
        {
            list[idx] = newCollider;
        }
        else
        {
            list.push(newCollider);
        }
        emit('select', list.length - 1);
    }
    else
    {
        localShape.value = newCollider;
    }
    OnPropChange();
}

function OnPropChange(): void
{
    const collider = currentCollider.value;
    if (collider !== null)
    {
        collider.x = Math.round(collider.x);
        collider.y = Math.round(collider.y);
        switch (collider.type)
        {
            case EMGeometryType.Circle:
                (collider as IColliderDataCircle).radius = Math.max(1, Math.round((collider as IColliderDataCircle).radius));
                break;
            case EMGeometryType.Rectangle:
            case EMGeometryType.Ellipse:
                (collider as IColliderDataRectangle).width = Math.max(1, Math.round((collider as IColliderDataRectangle).width));
                (collider as IColliderDataRectangle).height = Math.max(1, Math.round((collider as IColliderDataRectangle).height));
                break;
            case EMGeometryType.Capsule:
                (collider as IColliderDataCapsule).length = Math.max(1, Math.round((collider as IColliderDataCapsule).length));
                (collider as IColliderDataCapsule).radius = Math.max(1, Math.round((collider as IColliderDataCapsule).radius));
                break;
            case EMGeometryType.Pie:
                (collider as IColliderDataPie).radius = Math.max(1, Math.round((collider as IColliderDataPie).radius));
                (collider as IColliderDataPie).sweep = Math.max(1, Math.min(360, Math.round((collider as IColliderDataPie).sweep)));
                break;
            case EMGeometryType.Segment:
                (collider as IColliderDataSegment).length = Math.max(1, Math.round((collider as IColliderDataSegment).length));
                break;
            case EMGeometryType.Polygon:
                NormalizePolygonVertices(collider as IColliderDataPolygon);
                break;
        }
    }
    RefreshGraphics();
    EmitUpdate();
}

function NormalizePolygonVertices(collider: IColliderDataPolygon): void
{
    for (const v of collider.vertics)
    {
        v[0] = Math.round(v[0]);
        v[1] = Math.round(v[1]);
    }
}

function OnVertexInputChange(): void
{
    NormalizePolygonVertices(polygonCollider.value);
    RefreshGraphics();
    EmitUpdate();
}

function OnAddVertex(): void
{
    const collider = polygonCollider.value;
    if (collider === null) return;
    const bounds = GetPolygonBounds(collider);
    const cx = (bounds.minX + bounds.maxX) * 0.5;
    const cy = (bounds.minY + bounds.maxY) * 0.5;
    const newVertex: [number, number] = [Math.round(cx + 10), Math.round(cy)];
    collider.vertics.push(newVertex);
    RefreshGraphics();
    EmitUpdate();
}

function OnDeleteVertex(index: number): void
{
    const collider = polygonCollider.value;
    if (collider === null || collider.vertics.length <= 3) return;
    collider.vertics.splice(index, 1);
    RefreshGraphics();
    EmitUpdate();
}

function OnDeleteShape(): void
{
    if (isMultiMode.value)
    {
        const idx = selectedIndexLocal.value;
        if (idx >= 0 && idx < localShapeList.value.length)
        {
            localShapeList.value.splice(idx, 1);
        }
        emit('select', -1);
    }
    else
    {
        localShape.value = null;
    }
    RefreshGraphics();
    EmitUpdate();
}

function OnCreateShape(): void
{
    const newCollider: IColliderData = { type: EMGeometryType.Rectangle, x: 10, y: 10, width: 20, height: 20 };
    if (isMultiMode.value)
    {
        localShapeList.value.push(newCollider);
        emit('select', localShapeList.value.length - 1);
    }
    else
    {
        localShape.value = newCollider;
    }
    RefreshGraphics();
    EmitUpdate();
}

function EmitUpdate(): void
{
    if (isMultiMode.value)
    {
        emit('update:shapeList', JSON.parse(JSON.stringify(localShapeList.value)) as IColliderData[]);
    }
    else
    {
        emit('update:shape', JSON.parse(JSON.stringify(localShape.value)) as IColliderData | null);
    }
}

function OnShapeDown(event: Event): void
{
    if (app === null) return;
    const e = event as PointerEvent;
    const mouse = GetLocalMouse();

    if (isMultiMode.value && e.button === 0)
    {
        SelectColliderAt(mouse.x, mouse.y);
        const selected = currentCollider.value;
        if (selected !== null && selected.type === EMGeometryType.Polygon)
        {
            return;
        }
    }

    isDragging = true;
    dragStartX = app.renderer.events.pointer.global.x;
    dragStartY = app.renderer.events.pointer.global.y;
    dragStartLocalX = mouse.x;
    dragStartLocalY = mouse.y;
    const collider = currentCollider.value;
    if (collider !== null)
    {
        colliderStartX = collider.x;
        colliderStartY = collider.y;
    }
}

function SelectColliderAt(x: number, y: number): void
{
    if (!isMultiMode.value) return;
    const list = localShapeList.value;
    let bestIndex = -1;
    for (let i = list.length - 1; i >= 0; i--)
    {
        if (IsPointInCollider(list[i], x, y))
        {
            bestIndex = i;
            break;
        }
    }
    if (bestIndex !== selectedIndexLocal.value)
    {
        emit('select', bestIndex);
    }
}

function IsPointInCollider(collider: IColliderData, x: number, y: number): boolean
{
    switch (collider.type)
    {
        case EMGeometryType.Circle:
        {
            const c = collider as IColliderDataCircle;
            const cx = collider.x + c.radius;
            const cy = collider.y + c.radius;
            return (x - cx) ** 2 + (y - cy) ** 2 <= c.radius ** 2;
        }
        case EMGeometryType.Rectangle:
        case EMGeometryType.Ellipse:
        {
            const c = collider as IColliderDataRectangle;
            return x >= collider.x && x <= collider.x + c.width && y >= collider.y && y <= collider.y + c.height;
        }
        case EMGeometryType.Polygon:
        {
            return IsPointInPolygon(collider as IColliderDataPolygon, x, y);
        }
        default:
            return false;
    }
}

function OnHandleDown(): void
{
    if (app === null) return;
    isScaling = true;
    dragStartX = app.renderer.events.pointer.global.x;
    dragStartY = app.renderer.events.pointer.global.y;
    const collider = currentCollider.value;
    if (collider !== null)
    {
        colliderStartParamW = GetColliderWidth(collider);
        colliderStartParamH = GetColliderHeight(collider);
    }
}

function GetLocalMouse(): { x: number; y: number }
{
    if (app === null) return { x: 0, y: 0 };
    const mx = app.renderer.events.pointer.global.x;
    const my = app.renderer.events.pointer.global.y;
    const scale = GetScale();

    const transform = props.animationTransform;
    if (transform === undefined || transform === null)
    {
        return {
            x: (mx - props.viewport.originX) / scale,
            y: (my - props.viewport.originY) / scale
        };
    }

    if (previewRoot === null)
    {
        return {
            x: (mx - props.viewport.originX) / scale,
            y: (my - props.viewport.originY) / scale
        };
    }

    const pt = new Point(mx, my);
    const local = previewRoot.toLocal(pt, undefined);
    return {
        x: local.x / scale,
        y: local.y / scale
    };
}

function FindPolygonVertexAt(collider: IColliderDataPolygon, x: number, y: number, threshold: number): number | null
{
    for (let i = 0; i < collider.vertics.length; i++)
    {
        const v = collider.vertics[i];
        const dx = collider.x + v[0] - x;
        const dy = collider.y + v[1] - y;
        if (dx * dx + dy * dy <= threshold * threshold)
        {
            return i;
        }
    }
    return null;
}

function GetVertexHitThreshold(scale: number): number
{
    return VERTEX_HANDLE_OUTER_RADIUS / scale;
}

function FindPolygonEdgeAt(collider: IColliderDataPolygon, x: number, y: number, threshold: number): number | null
{
    const n = collider.vertics.length;
    if (n < 2) return null;
    let bestIndex: number | null = null;
    let bestDist2 = threshold * threshold;
    for (let i = 0; i < n; i++)
    {
        const a = collider.vertics[i];
        const b = collider.vertics[(i + 1) % n];
        const ax = collider.x + a[0];
        const ay = collider.y + a[1];
        const bx = collider.x + b[0];
        const by = collider.y + b[1];
        const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
        const px = ax + t * (bx - ax);
        const py = ay + t * (by - ay);
        const dx = px - x;
        const dy = py - y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < bestDist2)
        {
            bestDist2 = dist2;
            bestIndex = i;
        }
    }
    return bestIndex;
}

function IsPointInPolygon(collider: IColliderDataPolygon, x: number, y: number): boolean
{
    const n = collider.vertics.length;
    if (n < 3) return false;
    let inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++)
    {
        const xi = collider.x + collider.vertics[i][0];
        const yi = collider.y + collider.vertics[i][1];
        const xj = collider.x + collider.vertics[j][0];
        const yj = collider.y + collider.vertics[j][1];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function OnStageDown(event: Event): void
{
    if (app === null) return;
    const e = event as PointerEvent;
    const { x: lx, y: ly } = GetLocalMouse();

    if (isMultiMode.value && e.button === 0)
    {
        const selected = currentCollider.value;
        if (selected !== null && selected.type !== EMGeometryType.Polygon)
        {
            return;
        }
    }

    const collider = currentCollider.value;
    if (collider === null || collider.type !== EMGeometryType.Polygon) return;

    const polygon = collider as IColliderDataPolygon;
    const scale = GetScale();
    const vertexHitThreshold = GetVertexHitThreshold(scale);
    const edgeHitThreshold = Math.max(2, 2 / scale);

    const vertexIndex = FindPolygonVertexAt(polygon, lx, ly, vertexHitThreshold);
    if (vertexIndex !== null)
    {
        if (e.button === 2)
        {
            DeletePolygonVertex(vertexIndex);
            return;
        }
        dragVertexIndex = vertexIndex;
        dragVertexStartX = polygon.vertics[vertexIndex][0];
        dragVertexStartY = polygon.vertics[vertexIndex][1];
        dragStartX = app.renderer.events.pointer.global.x;
        dragStartY = app.renderer.events.pointer.global.y;
        return;
    }

    const edgeIndex = FindPolygonEdgeAt(polygon, lx, ly, edgeHitThreshold);
    if (edgeIndex !== null && e.button === 0)
    {
        InsertPolygonVertexAtEdge(edgeIndex, lx, ly);
        return;
    }

    if (IsPointInPolygon(polygon, lx, ly))
    {
        isDragging = true;
        colliderStartX = collider.x;
        colliderStartY = collider.y;
        dragStartX = app.renderer.events.pointer.global.x;
        dragStartY = app.renderer.events.pointer.global.y;
        dragStartLocalX = lx;
        dragStartLocalY = ly;
    }
}

function InsertPolygonVertexAtEdge(edgeIndex: number, x: number, y: number): void
{
    const collider = currentCollider.value;
    if (collider === null || collider.type !== EMGeometryType.Polygon) return;
    const polygon = collider as IColliderDataPolygon;
    const a = polygon.vertics[edgeIndex];
    const b = polygon.vertics[(edgeIndex + 1) % polygon.vertics.length];
    const nx = Math.round((a[0] + b[0]) * 0.5);
    const ny = Math.round((a[1] + b[1]) * 0.5);
    polygon.vertics.splice(edgeIndex + 1, 0, [nx, ny]);
    RefreshGraphics();
    EmitUpdate();
}

function DeletePolygonVertex(index: number): void
{
    const collider = currentCollider.value;
    if (collider === null || collider.type !== EMGeometryType.Polygon) return;
    const polygon = collider as IColliderDataPolygon;
    if (polygon.vertics.length <= 3) return;
    polygon.vertics.splice(index, 1);
    RefreshGraphics();
    EmitUpdate();
}

function OnContextMenu(event: Event): void
{
    event.preventDefault();
}

function DrawPolygonVertexHandles(scale: number): void
{
    if (vertexHandleGraphics === null) return;
    const collider = currentCollider.value;
    if (collider === null || collider.type !== EMGeometryType.Polygon)
    {
        vertexHandleGraphics.visible = false;
        return;
    }
    vertexHandleGraphics.visible = true;

    const polygon = collider as IColliderDataPolygon;
    const outerRadius = VERTEX_HANDLE_OUTER_RADIUS;
    const innerRadius = VERTEX_HANDLE_INNER_RADIUS;
    const ox = props.viewport.originX;
    const oy = props.viewport.originY;
    for (let i = 0; i < polygon.vertics.length; i++)
    {
        const v = polygon.vertics[i];
        const cx = ox + (collider.x + v[0]) * scale;
        const cy = oy + (collider.y + v[1]) * scale;
        vertexHandleGraphics.circle(cx, cy, outerRadius);
        vertexHandleGraphics.fill({ color: 0xffffff });
        vertexHandleGraphics.stroke({ width: 1, color: 0x000000 });
        vertexHandleGraphics.circle(cx, cy, innerRadius);
        vertexHandleGraphics.fill({ color: shapeColor.value });
        vertexHandleGraphics.stroke({ width: 1, color: 0x000000 });
    }
}

function OnStageMove(): void
{
    if (app === null) return;
    const scale = GetScale();
    const mx = app.renderer.events.pointer.global.x;
    const my = app.renderer.events.pointer.global.y;

    if (dragVertexIndex !== null)
    {
        const dx = (mx - dragStartX) / scale;
        const dy = (my - dragStartY) / scale;
        const collider = currentCollider.value;
        if (collider !== null && collider.type === EMGeometryType.Polygon)
        {
            const polygon = collider as IColliderDataPolygon;
            if (props.animationTransform !== undefined && props.animationTransform !== null && previewRoot !== null)
            {
                const deltaLocal = new Point(dx * scale, dy * scale);
                const deltaRoot = previewRoot.toGlobal(deltaLocal, undefined);
                const zeroGlobal = previewRoot.toGlobal(new Point(0, 0), undefined);
                const rootDx = (deltaRoot.x - zeroGlobal.x) / scale;
                const rootDy = (deltaRoot.y - zeroGlobal.y) / scale;
                polygon.vertics[dragVertexIndex][0] = Math.round(dragVertexStartX + rootDx);
                polygon.vertics[dragVertexIndex][1] = Math.round(dragVertexStartY + rootDy);
            }
            else
            {
                polygon.vertics[dragVertexIndex][0] = Math.round(dragVertexStartX + dx);
                polygon.vertics[dragVertexIndex][1] = Math.round(dragVertexStartY + dy);
            }
            RefreshGraphics();
        }
        return;
    }

    if (isDragging)
    {
        const dx = (mx - dragStartX) / scale;
        const dy = (my - dragStartY) / scale;
        const collider = currentCollider.value;
        if (collider !== null)
        {
            collider.x = Math.round(colliderStartX + dx);
            collider.y = Math.round(colliderStartY + dy);
            RefreshGraphics();
        }
        return;
    }

    if (isScaling)
    {
        const dx = (mx - dragStartX) / scale;
        const dy = (my - dragStartY) / scale;
        const collider = currentCollider.value;
        if (collider !== null)
        {
            switch (collider.type)
            {
                case EMGeometryType.Circle:
                    (collider as IColliderDataCircle).radius = Math.max(1, Math.round(colliderStartParamW * 0.5 + dx));
                    break;
                case EMGeometryType.Rectangle:
                case EMGeometryType.Ellipse:
                    (collider as IColliderDataRectangle).width = Math.max(1, Math.round(colliderStartParamW + dx));
                    (collider as IColliderDataRectangle).height = Math.max(1, Math.round(colliderStartParamH + dy));
                    break;
                case EMGeometryType.Capsule:
                    (collider as IColliderDataCapsule).length = Math.max(1, Math.round(colliderStartParamW + dx));
                    (collider as IColliderDataCapsule).radius = Math.max(1, Math.round(colliderStartParamH * 0.5 + dy));
                    break;
                case EMGeometryType.Pie:
                    (collider as IColliderDataPie).radius = Math.max(1, Math.round(colliderStartParamW * 0.5 + dx));
                    break;
                case EMGeometryType.Segment:
                    (collider as IColliderDataSegment).length = Math.max(1, Math.round(colliderStartParamW + dx));
                    break;
            }
            RefreshGraphics();
        }
    }
}

function OnStageUp(): void
{
    if (isDragging || isScaling || dragVertexIndex !== null)
    {
        isDragging = false;
        isScaling = false;
        dragVertexIndex = null;
        EmitUpdate();
    }
}
</script>

<style scoped>
.shapeEditorRoot {
    display: flex;
    gap: 12px;
}

.canvasWrap {
    flex: 1;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sumiStudioCore-color-surface-container-highest);
    border-radius: 4px;
}

.propPanel {
    width: 220px;
    display: flex;
    flex-direction: column;
    gap: 8px;
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
    width: 50px;
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

.toolRow {
    padding-top: 8px;
}
.vertexPanel {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--sumiStudioCore-color-surface-container-highest);
}

.vertexHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.vertexHeader label {
    width: auto;
    font-size: 12px;
    color: var(--sumiStudioCore-color-surface-on);
}

.vertexHint {
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-20);
}

.vertexRow {
    display: flex;
    align-items: center;
    gap: 4px;
}

.vertexIndex {
    width: 18px;
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-20);
    text-align: center;
}

.vertexInput {
    flex: 1;
    min-width: 0;
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    color: var(--sumiStudioCore-color-surface-on);
    font-size: 12px;
}

.vertexDelete {
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    font-size: 14px;
    color: var(--sumiStudioCore-color-error);
    cursor: pointer;
    border-radius: 4px;
}

.vertexDelete:hover {
    background: var(--sumiStudioCore-color-error-container);
}
</style>
