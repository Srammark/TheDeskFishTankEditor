/** 基底资源文件夹名 */
export const SUBSTRATE_FOLDER = 'Substrate' as const;

/** 基底类型 */
export enum EMSubstrateType
{
    /** 纹理基底 */
    Texture = 0
}

/** 基底类型选项 */
export const SubstrateTypeOptionList = [
    { value: EMSubstrateType.Texture, text: '纹理' }
];

/** 基底单张纹理视图 */
export interface ISubstrateTextureView
{
    /** 宽度（像素） */
    width: number;
    /** 高度（像素） */
    height: number;
    /** 图片文件名 */
    image: string;
}

/** 基底 item.json 数据结构 */
export interface ISubstrateItem
{
    /** 基底名称（与文件夹名一致） */
    name: string;
    /** 基底类型 */
    type: EMSubstrateType;
    /** 国际化名称键名，如 "substrate.sand.name" */
    nameKey: string;
    /** 国际化简介键名，如 "substrate.sand.description" */
    descriptionKey: string;
    /** 100×100 列表头像文件名 */
    thumbnail: string;
    /** 俯视图纹理 */
    topView: ISubstrateTextureView;
    /** 正视图（剖面）纹理 */
    frontView: ISubstrateTextureView;
}

/** 基底精灵图槽位 */
export type TSubstrateSpriteSlot = 'thumbnail' | 'top' | 'front';
