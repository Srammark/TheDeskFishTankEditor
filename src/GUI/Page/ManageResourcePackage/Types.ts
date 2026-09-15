import { URI } from '@/Core/Module/String_DLL/URI';
import type IServiceFile from '@/Core/IOC_DLL/Interface/File/IServiceFile';
import { EMGeometryType } from '@/Core/Module/Collision2D_DLL/Geometry/GeometryType';
import { SUBSTRATE_FOLDER } from './Substrate/TypeSubstrate';
import { GLASS_FOLDER } from './Glass/TypeGlass';

/** 资源文件夹常量 */
export const CREATURE_FOLDER = 'CreatureFolder' as const;
export const DECORATION_FOLDER = 'DecorationFolder' as const;
export { SUBSTRATE_FOLDER } from './Substrate/TypeSubstrate';
export { GLASS_FOLDER } from './Glass/TypeGlass';
export const STRAIN_FOLDER = 'StrainFolder' as const;
export const LANGUAGE_FOLDER = 'Language' as const;

/** 资源类型 */
export enum EMResourceType
{
    Creature = 'Creature',
    Decoration = 'Decoration',
    Substrate = 'Substrate',
    Glass = 'Glass'
}

/** 资源处理器上下文 */
export interface IResourceContext
{
    workUri: URI;
    sFile: IServiceFile;
}

/** 资源处理器接口 */
export interface IResourceHandler
{
    readonly ResourceType: EMResourceType;
    readonly FolderName: string;
    readonly DisplayName: string;
    Load(context: IResourceContext): Promise<void>;
    Save(context: IResourceContext): Promise<void>;
    GetTreeNodes(): ITreeNode[];
    Clear(): void;
}

/** 包信息 */
export interface IPackageInfo
{
    id: string;
    name: string;
    keywords: string;
    version: string;
    author: string;
    license: string;
}

/** 物种类型 */
export type TSpeciesCategory = 'Fish' | 'Shrimp' | 'Crab' | 'Snail' | 'Bivalve';

/** 物种描述 */
export interface ISpeciesDescription
{
    scientificName: string;
    nameKey: string;
    wikiKey: string;
    /** 物种类型（可选，旧资源包可能缺失） */
    category?: TSpeciesCategory;
}

/** 品系描述 */
export interface IStrainDescription
{
    scientificName: string;
    nameKey: string;
    wikiKey: string;
}

/** 时间换算常量（毫秒） */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const MS_PER_MONTH = 30 * MS_PER_DAY;
export const MS_PER_YEAR = 365 * MS_PER_DAY;

/** 昼夜习性 */
export type TDayNightHabit = 'Diurnal' | 'Nocturnal';

/** 食性 */
export type TDiet = 'Herbivore' | 'Carnivore' | 'Omnivore' | 'Filter' | 'Algae';

/** 繁殖方式 */
export type TReproduction = 'Oviparous' | 'Viviparous' | 'Ovoviviparous';

/** 生物通用属性（所有生物类型共有） */
export interface ICreatureItemBase
{
    speedLimit: number;
    visualRadius: number;
    stature: [[number, number], [number, number], [number, number]];
    swimmingLevel: [number, number];
    gregariousness: 0 | 1;
    idealGroupSize: number;
    aggression: number;
    /** 领地意识强度 0~1，0 表示无领地意识 */
    territoriality: number;
    diet: TDiet;
    metabolism: number;
    stressSensitivity: number;
    alertness: number;
    reproduction: TReproduction;
    temperature: [number, number];
    /** 寿命（毫秒） */
    lifespan: number;
    /** 性成熟年龄（毫秒） */
    matureAge: number;
    /** 每胎/每窝数量范围 [最小, 最大] */
    litterSize: [number, number];
    /** 孵化时间（毫秒） */
    hatchTime: number;
    /** 怀孕时长（毫秒） */
    gestationTime: number;
    /** 昼夜习性 */
    dayNightHabit: TDayNightHabit;
}

/** 游动模式（鱼类推进方式） */
export enum EMSwimMode
{
    /** 鳗形：全身长波摆动（鳗鲡） */
    Anguilliform = 'Anguilliform',
    /** 亚鲹形：躯干后半波动推进 */
    Subcarangiform = 'Subcarangiform',
    /** 鲹形：尾鳍为主推进，身体弯曲小 */
    Carangiform = 'Carangiform',
    /** 鲔形：新月形尾鳍高速推进（金枪鱼） */
    Thunniform = 'Thunniform',
    /** 箱鲀形：身体僵硬，仅尾鳍摆动 */
    Ostraciiform = 'Ostraciiform',
    /** 弓鳍鱼形：长基背鳍波动推进 */
    Amiiform = 'Amiiform',
    /** 电鳗形：长基臀鳍波动推进 */
    Gymnotiform = 'Gymnotiform',
    /** 鳞鲀形：背鳍与臀鳍同步波动 */
    Balistiform = 'Balistiform',
    /** 鲀形：胸鳍划动为主，背臀鳍辅助 */
    Tetraodontiform = 'Tetraodontiform',
    /** 鳐形：胸鳍波动或拍动推进 */
    Rajiform = 'Rajiform',
    /** 刺鲀形：胸鳍与尾鳍低速推进 */
    Diodontiform = 'Diodontiform',
    /** 隆头鱼形：胸鳍推进为主，尾鳍仅辅助 */
    Labriform = 'Labriform'
}

/** 鱼类属性 */
export interface IFishItem extends ICreatureItemBase
{
    /** 游动模式 */
    swimMode: EMSwimMode;
}

/** 虾类属性 */
export interface IShrimpItem extends ICreatureItemBase
{
    /** 蜕壳周期（毫秒）*/
    moltCycle: number;

    /** 蜕壳脆弱期时长（毫秒）*/
    moltVulnerabilityDuration: number;
}

/** 蟹类属性 */
export interface ICrabItem extends ICreatureItemBase
{
    /** 蜕壳周期（毫秒）*/
    moltCycle: number;

    /** 蜕壳脆弱期时长（毫秒）*/
    moltVulnerabilityDuration: number;
}

/** 螺类属性 */
export interface ISnailItem extends ICreatureItemBase
{
}

/** 贝类属性 */
export interface IBivalveItem extends ICreatureItemBase
{
    /** 滤水速率（毫升/秒） */
    filterRate: number;
}

/** 任意生物属性联合类型 */
export type ICreatureItem = IFishItem | IShrimpItem | ICrabItem | ISnailItem | IBivalveItem;

/** 物种类型对应的属性类型映射 */
export interface ICreatureItemMap
{
    Fish: IFishItem;
    Shrimp: IShrimpItem;
    Crab: ICrabItem;
    Snail: ISnailItem;
    Bivalve: IBivalveItem;
}

/** 精灵图体型 */
export type TSpriteSize = 'Small' | 'Medium' | 'Large';

/** 精灵图动作 */
export type TSpriteAction = 'idle' | 'swim' | 'eat';

/** 碰撞体槽位 */
export type TColliderSlot = 'body' | 'mouth';

/** 圆形碰撞体数据 */
export interface IColliderDataCircle
{
    type: EMGeometryType.Circle;
    x: number;
    y: number;
    radius: number;
}

/** 矩形碰撞体数据 */
export interface IColliderDataRectangle
{
    type: EMGeometryType.Rectangle;
    x: number;
    y: number;
    width: number;
    height: number;
}

/** 胶囊碰撞体数据 */
export interface IColliderDataCapsule
{
    type: EMGeometryType.Capsule;
    x: number;
    y: number;
    length: number;
    radius: number;
}

/** 多边形碰撞体数据 */
export interface IColliderDataPolygon
{
    type: EMGeometryType.Polygon;
    x: number;
    y: number;
    vertics: [number, number][];
}

/** 椭圆碰撞体数据 */
export interface IColliderDataEllipse
{
    type: EMGeometryType.Ellipse;
    x: number;
    y: number;
    width: number;
    height: number;
}

/** 扇形碰撞体数据 */
export interface IColliderDataPie
{
    type: EMGeometryType.Pie;
    x: number;
    y: number;
    radius: number;
    sweep: number;
}

/** 线段碰撞体数据 */
export interface IColliderDataSegment
{
    type: EMGeometryType.Segment;
    x: number;
    y: number;
    length: number;
    normal: [number, number];
}

/** 碰撞体数据联合类型 */
export type IColliderData =
    | IColliderDataCircle
    | IColliderDataRectangle
    | IColliderDataCapsule
    | IColliderDataPolygon
    | IColliderDataEllipse
    | IColliderDataPie
    | IColliderDataSegment;

/** 生物碰撞体基础形状（动作级，所有帧共用；帧动画中可被帧级覆盖） */
export interface ICreatureCollider
{
    body: IColliderData | null;
    mouth: IColliderData | null;
}

/** 生物帧级碰撞体覆盖（稀疏：仅记录与基础形状有差距的槽位） */
export interface ICreatureColliderOverride
{
    body?: IColliderData;
    mouth?: IColliderData;
}

/** 单帧数据 */
export interface IFrameData
{
    /** 该帧的碰撞体形状覆盖（稀疏：仅记录与动作级基础形状有差距的槽位） */
    colliderOverride: ICreatureColliderOverride;
}

/** 动作数据 */
export interface IActionData
{
    fps: number;
    /** 基础碰撞体形状（所有帧共用；帧动画中可被帧级覆盖） */
    collider: ICreatureCollider;
    frameList: IFrameData[];
}

/** Size配置 */
export interface ISizeConfig
{
    frameSize: [number, number];
    actionRowOrder: TSpriteAction[];
    actionList: Record<TSpriteAction, IActionData>;
}

/** 装饰物程序化动画类型 */
export enum EMDecorationTweenAnimationType
{
    None = 'None',
    Sway = 'Sway',
    Breathe = 'Breathe',
    Rotate = 'Rotate'
}

/** 装饰物摇摆动画参数 */
export interface IDecorationTweenAnimationSway
{
    type: EMDecorationTweenAnimationType.Sway;
    /** 摆动幅度（像素） */
    amplitude: number;
    /** 摆动频率（次/秒） */
    frequency: number;
    /** 初始相位（0-1） */
    phase: number;
    /** 摆动方向：水平或垂直 */
    axis: 'x' | 'y';
}

/** 装饰物缩放呼吸动画参数 */
export interface IDecorationTweenAnimationBreathe
{
    type: EMDecorationTweenAnimationType.Breathe;
    /** 最小缩放比例 */
    minScale: number;
    /** 最大缩放比例 */
    maxScale: number;
    /** 呼吸频率（次/秒） */
    frequency: number;
}

/** 装饰物旋转动画参数 */
export interface IDecorationTweenAnimationRotate
{
    type: EMDecorationTweenAnimationType.Rotate;
    /** 最小角度（度） */
    minAngle: number;
    /** 最大角度（度） */
    maxAngle: number;
    /** 旋转频率（次/秒） */
    frequency: number;
    /** 旋转锚点，相对于子部件中心，单位像素 */
    pivot: [number, number];
}

/** 装饰物程序化动画联合类型 */
export type IDecorationTweenAnimation = | IDecorationTweenAnimationSway | IDecorationTweenAnimationBreathe | IDecorationTweenAnimationRotate;

/** 装饰物动画模式 */
export enum EMDecorationAnimationMode
{
    None = 'None',
    Tween = 'Tween',
    Frame = 'Frame'
}

/** 装饰物帧动画中单个功能区域的帧级状态覆盖 */
export interface IDecorationAreaFrameOverride
{
    /** 关联的区域 id（IDecorationPart.areaList 中的 id） */
    areaID: string;
    /** 该帧是否显示；undefined 视为显示 */
    visible?: boolean;
    /** 该帧的区域形状覆盖；undefined 表示沿用 part 级基础形状 */
    collider?: IColliderData;
}

/** 装饰物帧动画中单个碰撞体的帧级覆盖 */
export interface IDecorationColliderFrameOverride
{
    /** 关联的碰撞体 id（IDecorationPart.colliderList 中的 id） */
    colliderID: string;
    /** 该帧的碰撞体形状 */
    collider: IColliderData;
}

/** 装饰物帧动画单帧数据 */
export interface IDecorationFrameData
{
    /** 该帧的碰撞体形状覆盖列表（稀疏：仅记录与 part 级基础形状有差距的碰撞体） */
    colliderOverrideList: IDecorationColliderFrameOverride[];
    /** 该帧的功能区域状态覆盖列表（稀疏：仅记录有变化的区域，未记录的区域默认显示且沿用 part 级基础形状） */
    areaOverrideList: IDecorationAreaFrameOverride[];
}

/** 装饰物帧动画参数 */
export interface IDecorationFrameAnimation
{
    /** 帧率 */
    fps: number;
    /** 单帧尺寸 [宽, 高] */
    frameSize: [number, number];
    /** 帧数据列表 */
    frameList: IDecorationFrameData[];
}

/** 动画变换状态（用于把碰撞体/区域与精灵图一起变换） */
export interface IDecorationAnimationTransform
{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    pivotX: number;
    pivotY: number;
}

/**
 * 根据装饰物动画参数计算某一时刻的变换状态.
 * @param animation 动画参数
 * @param time 时间（秒）
 * @returns 变换状态
 */
export function ComputeDecorationAnimationTransform(animation: IDecorationTweenAnimation | undefined, time: number): IDecorationAnimationTransform
{
    const identity: IDecorationAnimationTransform = {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        pivotX: 0,
        pivotY: 0
    };

    if (animation === undefined)
    {
        return identity;
    }

    switch (animation.type)
    {
        case EMDecorationTweenAnimationType.Sway:
        {
            const params = animation as IDecorationTweenAnimationSway;
            const phase = params.phase * Math.PI * 2;
            const value = Math.sin(time * params.frequency * Math.PI * 2 + phase) * params.amplitude;
            return {
                ...identity,
                x: params.axis === 'x' ? value : 0,
                y: params.axis === 'y' ? value : 0
            };
        }
        case EMDecorationTweenAnimationType.Breathe:
        {
            const params = animation as IDecorationTweenAnimationBreathe;
            const mid = (params.maxScale + params.minScale) * 0.5;
            const amp = (params.maxScale - params.minScale) * 0.5;
            const scale = mid + Math.sin(time * params.frequency * Math.PI * 2) * amp;
            return {
                ...identity,
                scaleX: scale,
                scaleY: scale
            };
        }
        case EMDecorationTweenAnimationType.Rotate:
        {
            const params = animation as IDecorationTweenAnimationRotate;
            const mid = (params.maxAngle + params.minAngle) * 0.5;
            const amp = (params.maxAngle - params.minAngle) * 0.5;
            const angleDeg = mid + Math.sin(time * params.frequency * Math.PI * 2) * amp;
            return {
                ...identity,
                rotation: angleDeg * Math.PI / 180,
                pivotX: params.pivot[0],
                pivotY: params.pivot[1]
            };
        }
        default:
            return identity;
    }
}

/** 装饰物功能区域类型 */
export enum EMDecorationAreaType
{
    Shelter = 'Shelter',
    Food = 'Food'
}

/** 庇护区属性 */
export interface IDecorationAreaShelter
{
    type: EMDecorationAreaType.Shelter;
    /** 隐蔽度（0-1），恐慌/高压时寻找高隐蔽度区域 */
    concealment: number;
    /** 休息效率（0-1），睡眠时寻找高休息效率区域 */
    restEfficiency: number;
    /** 压力缓解速率（0-1） */
    comfort: number;
    /** 最大容纳鱼数 */
    maxFishCount: number;
}

/** 食物类型 */
export type TFoodType = 'Feed' | 'Algae' | 'Biofilm' | 'Plant' | 'Plankton';

/** 食物区属性 */
export interface IDecorationAreaFood
{
    type: EMDecorationAreaType.Food;
    /** 产出食物类型 */
    foodType: TFoodType;
    /** 每秒生成食物数量 */
    foodPerSecond: number;
    /** 最大容纳食物数量 */
    maxFood: number;
    /** 初始食物数量 */
    initialFood: number;
    /** 是否显示食物 */
    isShowFood: boolean;
}

/** 装饰物功能区域联合类型 */
export type IDecorationArea =
    | IDecorationAreaShelter
    | IDecorationAreaFood;

/** 装饰物功能区域完整配置 */
export interface IDecorationAreaConfig
{
    /** 区域唯一标识 */
    id: string;
    /** 区域显示名称 */
    name: string;
    /** 区域类型数据（含类型与类型专属属性） */
    area: IDecorationArea;
    /** 区域基础形状（复用碰撞体形状数据）；帧动画中可被帧级覆盖（见 IDecorationAreaFrameOverride） */
    collider: IColliderData;
}

/** 装饰物碰撞体配置 */
export interface IDecorationColliderConfig
{
    /** 碰撞体唯一标识 */
    id: string;
    /** 碰撞体基础形状；帧动画中可被帧级覆盖（见 IDecorationColliderFrameOverride） */
    collider: IColliderData;
}

/** 装饰物子部件 */
export interface IDecorationPart
{
    /** 子部件唯一标识 */
    id: string;
    /** 子部件名称 */
    name: string;
    /** Z 轴层级，数值越大越靠前 */
    zIndex: number;
    /** 精灵图文件名（相对于 DecorationFolder/<decoration>/Sprite/<partName>.png） */
    sprite?: string;
    /** 动画模式：程序化或帧动画 */
    animationMode?: EMDecorationAnimationMode;
    /** 程序化动画参数 */
    tweenAnimation?: IDecorationTweenAnimation;
    /** 帧动画参数 */
    frameAnimation?: IDecorationFrameAnimation;
    /** 基础碰撞体列表（支持多个，所有帧共用；帧动画中可被帧级覆盖，见 IDecorationColliderFrameOverride） */
    colliderList?: IDecorationColliderConfig[];
    /** 功能区域列表 */
    areaList: IDecorationAreaConfig[];
}

/** 装饰物分类 */
export enum EMDecorationCategory
{
    /** 其他 */
    Other = 0,
    /** 植物 */
    Plant = 1,
    /** 岩石 */
    Rock = 2,
    /** 摆件(例如 木桶、玻璃瓶) */
    Ornament = 3,
    /** 建筑 */
    Building = 4
}

/** 装饰物分类选项 */
export const DecorationCategoryOptionList = [
    { value: EMDecorationCategory.Other, text: '其他' },
    { value: EMDecorationCategory.Plant, text: '植物' },
    { value: EMDecorationCategory.Rock, text: '岩石' },
    { value: EMDecorationCategory.Ornament, text: '摆件' },
    { value: EMDecorationCategory.Building, text: '建筑' }
];

/** 装饰物属性 */
export interface IDecorationItem
{
    /** 装饰物名称（与文件夹名一致） */
    name: string;
    /** 分类 */
    category: EMDecorationCategory;
    /** 国际化名称键名，如 "decoration.apple.name" */
    nameKey: string;
    /** 国际化简介键名，如 "decoration.apple.description" */
    descriptionKey: string;
    /** 子部件列表 */
    partList: IDecorationPart[];
}

/** 性别目录 */
export type TSexFolder = 'Male' | 'Female' | 'Fry';

/** 食性选项 */
export const DietOptionList = [
    { value: 'Herbivore' as const, text: '草食性' },
    { value: 'Carnivore' as const, text: '肉食性' },
    { value: 'Omnivore' as const, text: '杂食性' },
    { value: 'Filter' as const, text: '滤食性' },
    { value: 'Algae' as const, text: '藻类食性' }
];

/** 群居性选项 */
export const GregariousnessOptionList = [
    { value: 0 as const, text: '否' },
    { value: 1 as const, text: '是' }
];

/** 繁殖方式选项 */
export const ReproductionOptionList = [
    { value: 'Oviparous' as const, text: '卵生' },
    { value: 'Viviparous' as const, text: '胎生' },
    { value: 'Ovoviviparous' as const, text: '卵胎生' }
];

/** 昼夜习性选项 */
export const DayNightHabitOptionList = [
    { value: 'Diurnal' as const, text: '日行' },
    { value: 'Nocturnal' as const, text: '夜行' }
];

/** 游动模式选项 */
export const SwimModeOptionList = [
    { value: EMSwimMode.Anguilliform, text: '鳗形 (Anguilliform)' },
    { value: EMSwimMode.Subcarangiform, text: '亚鲹形 (Subcarangiform)' },
    { value: EMSwimMode.Carangiform, text: '鲹形 (Carangiform)' },
    { value: EMSwimMode.Thunniform, text: '鲔形 (Thunniform)' },
    { value: EMSwimMode.Ostraciiform, text: '箱鲀形 (Ostraciiform)' },
    { value: EMSwimMode.Amiiform, text: '弓鳍鱼形 (Amiiform)' },
    { value: EMSwimMode.Gymnotiform, text: '电鳗形 (Gymnotiform)' },
    { value: EMSwimMode.Balistiform, text: '鳞鲀形 (Balistiform)' },
    { value: EMSwimMode.Tetraodontiform, text: '鲀形 (Tetraodontiform)' },
    { value: EMSwimMode.Rajiform, text: '鳐形 (Rajiform)' },
    { value: EMSwimMode.Diodontiform, text: '刺鲀形 (Diodontiform)' },
    { value: EMSwimMode.Labriform, text: '隆头鱼形 (Labriform)' }
];

/** 物种类型选项 */
export const SpeciesCategoryOptionList = [
    { value: 'Fish' as const, text: '鱼' },
    { value: 'Shrimp' as const, text: '虾' },
    { value: 'Crab' as const, text: '蟹' },
    { value: 'Snail' as const, text: '螺' },
    { value: 'Bivalve' as const, text: '贝类' }
];

/** IETF BCP 47 语言标签选项 */
export const LanguageTagOptionList = [
    { value: 'zh-Hans', text: 'zh-Hans - 简体中文' },
    { value: 'zh-Hant', text: 'zh-Hant - 繁体中文' },
    { value: 'en', text: 'en - 英语' },
    { value: 'ja', text: 'ja - 日语' },
    { value: 'ko', text: 'ko - 韩语' },
    { value: 'fr', text: 'fr - 法语' },
    { value: 'de', text: 'de - 德语' },
    { value: 'es', text: 'es - 西班牙语' },
    { value: 'ru', text: 'ru - 俄语' },
    { value: 'pt', text: 'pt - 葡萄牙语' },
    { value: 'it', text: 'it - 意大利语' },
    { value: 'ar', text: 'ar - 阿拉伯语' },
    { value: 'hi', text: 'hi - 印地语' },
    { value: 'th', text: 'th - 泰语' },
    { value: 'vi', text: 'vi - 越南语' },
    { value: 'id', text: 'id - 印尼语' },
    { value: 'ms', text: 'ms - 马来语' },
    { value: 'tr', text: 'tr - 土耳其语' },
    { value: 'pl', text: 'pl - 波兰语' },
    { value: 'nl', text: 'nl - 荷兰语' }
];

/** 树节点类型 */
export enum EMTreeNodeType
{
    PackageInfo = 'PackageInfo',
    LanguageFolder = 'LanguageFolder',
    LanguageFile = 'LanguageFile',
    CreatureFolder = 'CreatureFolder',
    CreatureCategory = 'CreatureCategory',
    Species = 'Species',
    SpeciesDesc = 'SpeciesDesc',
    Strain = 'Strain',
    Sex = 'Sex',
    ItemJson = 'ItemJson',
    SpriteFolder = 'SpriteFolder',
    DecorationFolder = 'DecorationFolder',
    DecorationItem = 'DecorationItem',
    DecorationPart = 'DecorationPart',
    DecorationSpriteFolder = 'DecorationSpriteFolder',
    SubstrateFolder = 'SubstrateFolder',
    SubstrateItem = 'SubstrateItem',
    GlassFolder = 'GlassFolder',
    GlassItem = 'GlassItem'
}

/** 树节点数据 */
export interface ITreeNode
{
    id: string;
    type: EMTreeNodeType;
    resourceType: EMResourceType | null;
    label: string;
    path: string;
    children?: ITreeNode[];
    expanded?: boolean;
    speciesName?: string;
    strainName?: string;
    sexName?: TSexFolder;
    sizeName?: TSpriteSize;
    actionName?: TSpriteAction;
    decorationName?: string;
    partID?: string;
    substrateName?: string;
    glassName?: string;
    langTag?: string;
}

/** 装饰物区域类型选项 */
export const DecorationAreaTypeOptionList = [
    { value: EMDecorationAreaType.Shelter, text: '庇护区' },
    { value: EMDecorationAreaType.Food, text: '食物区' }
];

/** 食物类型选项 */
export const FoodTypeOptionList = [
    { value: 'Feed' as const, text: '人工饲料' },
    { value: 'Algae' as const, text: '藻类' },
    { value: 'Biofilm' as const, text: '生物膜' },
    { value: 'Plant' as const, text: '植物' },
    { value: 'Plankton' as const, text: '浮游生物' }
];

/** 装饰物程序化动画类型选项 */
export const DecorationAnimationTypeOptionList = [
    { value: EMDecorationTweenAnimationType.None, text: '无' },
    { value: EMDecorationTweenAnimationType.Sway, text: '摇摆' },
    { value: EMDecorationTweenAnimationType.Breathe, text: '呼吸' },
    { value: EMDecorationTweenAnimationType.Rotate, text: '旋转' }
];

/** 摇摆方向选项 */
export const SwayAxisOptionList = [
    { value: 'x' as const, text: '水平' },
    { value: 'y' as const, text: '垂直' }
];

/** 编辑器当前选中状态 */
export interface IEditorSelection
{
    nodeType: EMTreeNodeType;
    nodeID: string;
    resourceType: EMResourceType | null;
    speciesName?: string;
    strainName?: string;
    sexName?: TSexFolder;
    langTag?: string;
    decorationName?: string;
    partID?: string;
    substrateName?: string;
    glassName?: string;
}
