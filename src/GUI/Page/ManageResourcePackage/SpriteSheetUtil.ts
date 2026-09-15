import {
    Application,
    Container,
    Sprite,
    Texture,
    Rectangle,
    RenderTexture,
    TextureSource
} from 'pixi.js';

TextureSource.defaultOptions.scaleMode = 'nearest';
import { EMGeometryType } from '@/Core/Module/Collision2D_DLL/Geometry/GeometryType';
import type {
    TSpriteAction,
    ISizeConfig,
    IColliderData
} from './Types';

let sharedApp: Application | null = null;

const ActionList: TSpriteAction[] = ['idle', 'swim', 'eat'];

async function GetSharedApp(): Promise<Application>
{
    if (sharedApp !== null) return sharedApp;
    sharedApp = new Application();
    await sharedApp.init({
        width: 1,
        height: 1,
        backgroundAlpha: 0,
        canvas: document.createElement('canvas')
    });
    return sharedApp;
}

export async function BuildSpriteSheet(
    frames: Record<TSpriteAction, (Uint8Array | null)[]>,
    frameSize: [number, number]
): Promise<Uint8Array>
{
    const app = await GetSharedApp();
    const container = new Container();

    const maxFrameCount = Math.max(...ActionList.map(a => frames[a].length));
    const [fw, fh] = frameSize;
    const sheetWidth = Math.max(maxFrameCount * fw, 1);
    const sheetHeight = Math.max(ActionList.length * fh, 1);

    for (let row = 0; row < ActionList.length; row++)
    {
        const actionFrames = frames[ActionList[row]];
        for (let col = 0; col < actionFrames.length; col++)
        {
            const frameData = actionFrames[col];
            if (frameData !== null)
            {
                const blob = new Blob([frameData.buffer as ArrayBuffer], { type: 'image/png' });
                const bitmap = await createImageBitmap(blob);
                const texture = Texture.from(bitmap);
                const sprite = new Sprite(texture);
                sprite.x = col * fw + Math.max(0, (fw - texture.width) / 2);
                sprite.y = row * fh + Math.max(0, (fh - texture.height) / 2);
                container.addChild(sprite);
            }
        }
    }

    const renderTexture = RenderTexture.create({
        width: sheetWidth,
        height: sheetHeight
    });
    app.renderer.render({ container, target: renderTexture });

    const canvas = app.renderer.extract.canvas(renderTexture) as HTMLCanvasElement;
    const blob = await new Promise<Blob>((resolve) =>
    {
        canvas.toBlob((b) =>
        {
            if (b !== null && b !== undefined) resolve(b);
        }, 'image/png');
    });
    const arrayBuffer = await blob.arrayBuffer();
    const result = new Uint8Array(arrayBuffer);

    renderTexture.destroy();
    container.destroy({ children: true });

    return result;
}

export async function ParseSpriteSheet(
    spriteSheet: Uint8Array,
    frameSize: [number, number],
    frameCounts: Record<TSpriteAction, number>
): Promise<Record<TSpriteAction, (Uint8Array | null)[]>>
{
    const blob = new Blob([spriteSheet.buffer as ArrayBuffer], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);

    const result: Record<TSpriteAction, (Uint8Array | null)[]> = {
        idle: [],
        swim: [],
        eat: []
    };

    const [fw, fh] = frameSize;

    for (let row = 0; row < ActionList.length; row++)
    {
        const actionName = ActionList[row];
        const count = frameCounts[actionName];
        for (let col = 0; col < count; col++)
        {
            const canvas = document.createElement('canvas');
            canvas.width = fw;
            canvas.height = fh;
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0, 0, fw, fh);
            ctx.drawImage(bitmap, col * fw, row * fh, fw, fh, 0, 0, fw, fh);

            const frameBlob = await new Promise<Blob>((resolve) =>
            {
                canvas.toBlob((b) =>
                {
                    if (b !== null) resolve(b);
                }, 'image/png');
            });
            const arrayBuffer = await frameBlob.arrayBuffer();
            result[actionName].push(new Uint8Array(arrayBuffer));
        }
    }

    return result;
}

export async function LoadSpriteSheetTexture(spriteSheet: Uint8Array): Promise<Texture>
{
    const blob = new Blob([spriteSheet.buffer as ArrayBuffer], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);
    return Texture.from(bitmap);
}

export function ExtractFrameTexture(
    sheetTexture: Texture,
    actionName: TSpriteAction,
    frameIndex: number,
    frameSize: [number, number]
): Texture
{
    const [fw, fh] = frameSize;
    const row = ActionList.indexOf(actionName);
    const col = frameIndex;
    return new Texture({
        source: sheetTexture.source,
        frame: new Rectangle(col * fw, row * fh, fw, fh)
    });
}

export async function GenerateDefaultCollider(
    imageData: Uint8Array,
    frameSize: [number, number]
): Promise<IColliderData | null>
{
    const canvas = document.createElement('canvas');
    canvas.width = frameSize[0];
    canvas.height = frameSize[1];
    const ctx = canvas.getContext('2d');
    if (ctx === null) return null;

    const blob = new Blob([imageData.buffer as ArrayBuffer], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);
    const offsetX = Math.max(0, (canvas.width - bitmap.width) / 2);
    const offsetY = Math.max(0, (canvas.height - bitmap.height) / 2);
    ctx.drawImage(bitmap, offsetX, offsetY);

    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageDataObj.data;

    const alphaThreshold = 10;
    const opaquePixels: [number, number][] = [];

    for (let y = 0; y < canvas.height; y++)
    {
        for (let x = 0; x < canvas.width; x++)
        {
            const alpha = data[(y * canvas.width + x) * 4 + 3];
            if (alpha > alphaThreshold)
            {
                opaquePixels.push([x, y]);
            }
        }
    }

    if (opaquePixels.length === 0) return null;

    const hull = ComputeConvexHull(opaquePixels);
    if (hull.length < 3) return null;

    let minX = hull[0][0];
    let minY = hull[0][1];
    for (const p of hull)
    {
        minX = Math.min(minX, p[0]);
        minY = Math.min(minY, p[1]);
    }

    const vertics: [number, number][] = hull.map(p => [p[0] - minX, p[1] - minY]);
    SimplifyPolygon(vertics, 2);

    if (vertics.length < 3) return null;

    // 帧图像坐标原点在左上角，碰撞体坐标原点在物体中心，需要偏移半个帧尺寸
    return {
        type: EMGeometryType.Polygon,
        x: minX - frameSize[0] / 2,
        y: minY - frameSize[1] / 2,
        vertics
    };
}

function ComputeConvexHull(points: [number, number][]): [number, number][]
{
    if (points.length <= 1) return points.slice();

    const sorted = points.slice().sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
    const lower: [number, number][] = [];
    for (const p of sorted)
    {
        while (lower.length >= 2 && Cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
        {
            lower.pop();
        }
        lower.push(p);
    }

    const upper: [number, number][] = [];
    for (let i = sorted.length - 1; i >= 0; i--)
    {
        const p = sorted[i]!;
        while (upper.length >= 2 && Cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
        {
            upper.pop();
        }
        upper.push(p);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

function Cross(o: [number, number], a: [number, number], b: [number, number]): number
{
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function SimplifyPolygon(vertics: [number, number][], tolerance: number): void
{
    if (vertics.length <= 4) return;

    let removed = true;
    const tol2 = tolerance * tolerance;
    while (removed && vertics.length > 4)
    {
        removed = false;
        for (let i = 0; i < vertics.length; i++)
        {
            const prev = vertics[(i - 1 + vertics.length) % vertics.length]!;
            const curr = vertics[i]!;
            const next = vertics[(i + 1) % vertics.length]!;
            const dist = PointToSegmentDistance2(curr, prev, next);
            if (dist <= tol2)
            {
                vertics.splice(i, 1);
                removed = true;
                break;
            }
        }
    }
}

function PointToSegmentDistance2(p: [number, number], a: [number, number], b: [number, number]): number
{
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2;
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a[0] + t * dx;
    const py = a[1] + t * dy;
    return (p[0] - px) ** 2 + (p[1] - py) ** 2;
}
