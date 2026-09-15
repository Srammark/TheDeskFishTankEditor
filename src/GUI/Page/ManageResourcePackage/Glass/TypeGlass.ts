/** 玻璃资源文件夹名 */
export const GLASS_FOLDER = 'Glass' as const;

/** 默认整体颜色 */
export const GLASS_DEFAULT_OVERALL_COLOR = '#78bbd4';

/** 玻璃部件键名 */
export type TGlassPartKey =
    | 'LeftSurface'
    | 'BackSurface'
    | 'FrontSurface'
    | 'RightSurface'
    | 'BottomSurface'
    | 'GlassEdge';

/** 玻璃部件元数据 */
export interface IGlassPartMeta
{
    key: TGlassPartKey;
    label: string;
    defaultAlpha: number;
}

/** 玻璃部件元数据列表 */
export const GlassPartMetaList: IGlassPartMeta[] = [
    { key: 'LeftSurface', label: '左侧玻璃面', defaultAlpha: 170 },
    { key: 'BackSurface', label: '背板玻璃面', defaultAlpha: 200 },
    { key: 'FrontSurface', label: '正面玻璃面', defaultAlpha: 170 },
    { key: 'RightSurface', label: '右侧玻璃面', defaultAlpha: 170 },
    { key: 'BottomSurface', label: '底部玻璃面', defaultAlpha: 210 },
    { key: 'GlassEdge', label: '玻璃边缘', defaultAlpha: 170 }
];

/** 玻璃部件类型 */
export enum EMGlassPartType
{
    /** 颜色 */
    Color = 0,
    /** 纹理 */
    Texture = 1
}

/** 玻璃部件类型选项 */
export const GlassPartTypeOptionList = [
    { value: EMGlassPartType.Color, text: '颜色' },
    { value: EMGlassPartType.Texture, text: '纹理' }
];

/** 纹理填充模式 */
export enum EMGlassTextureMode
{
    /** 拉伸 */
    Stretch = 0,
    /** 平铺 */
    Tile = 1
}

/** 纹理填充模式选项 */
export const GlassTextureModeOptionList = [
    { value: EMGlassTextureMode.Stretch, text: '拉伸' },
    { value: EMGlassTextureMode.Tile, text: '平铺' }
];

/** 玻璃单部件数据 */
export interface IGlassPart
{
    /** 填充类型 */
    type: EMGlassPartType;
    /** 颜色（不含 Alpha 的 HEX，例如 #78bbd4） */
    color: string;
    /** 不透明度（0-255） */
    alpha: number;
    /** 纹理图片文件名 */
    textureImage: string;
    /** 纹理填充模式 */
    textureMode: EMGlassTextureMode;
}

/** 玻璃样式 item.json 数据结构 */
export interface IGlassStyleItem
{
    /** 玻璃样式名称（与文件夹名一致） */
    name: string;
    /** 国际化名称键名，如 "glass.default.name" */
    nameKey: string;
    /** 国际化简介键名，如 "glass.default.description" */
    descriptionKey: string;
    /** 100×100 列表头像文件名 */
    thumbnail: string;
    /** 各玻璃部件配置 */
    partMap: Record<TGlassPartKey, IGlassPart>;
}

/** 玻璃纹理槽位 */
export type TGlassTextureSlot = TGlassPartKey;

/**
 * 创建默认玻璃部件数据。
 * @returns 默认玻璃部件数据
 */
export function CreateDefaultGlassPart(): IGlassPart
{
    return {
        type: EMGlassPartType.Color,
        color: GLASS_DEFAULT_OVERALL_COLOR,
        alpha: 255,
        textureImage: 'texture.png',
        textureMode: EMGlassTextureMode.Stretch
    };
}

/**
 * 创建默认玻璃样式数据。
 * @param styleName 样式名称
 * @returns 默认玻璃样式数据
 */
export function CreateDefaultGlassStyleItem(styleName: string): IGlassStyleItem
{
    const partMap = {} as Record<TGlassPartKey, IGlassPart>;
    for (const meta of GlassPartMetaList)
    {
        partMap[meta.key] = {
            type: EMGlassPartType.Color,
            color: GLASS_DEFAULT_OVERALL_COLOR,
            alpha: meta.defaultAlpha,
            textureImage: `${meta.key}.png`,
            textureMode: EMGlassTextureMode.Stretch
        };
    }

    return {
        name: styleName,
        nameKey: '',
        descriptionKey: '',
        thumbnail: 'image.png',
        partMap
    };
}
