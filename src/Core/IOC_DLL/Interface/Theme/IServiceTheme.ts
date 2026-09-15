import type { DelegateEvent } from "sumi-tsextension";

export default interface IServiceTheme
{
    get Color(): typeof Color;
    // 是否为暗黑主题
    get IsDark(): boolean;
    get DLightDarkChange(): DelegateEvent<(isDark: boolean) => void>;
    get DColorChange(): DelegateEvent<() => void>;

    /**
     * 修改主题颜色
     * @param color 表示颜色的十六进制代码的字符串。可以接受带或不带#的字符串，以及使用3、6或8个十六进制字符表示的颜色字符串。
     * @param isDark 是否为暗黑主题
     */
    ChangeSourceColor(color: string, isDark: boolean): void;
}

/** 
 * Variant 变体，类似的东西。例如：Outline的变体就是"分割线"，作用相似。
 * Fixed 浮动控件使用
 * Dim 暗
 * Bright 亮
 */
export const Color =
{
    /** 用于按钮、纸片(Chip)等突出控件（目的是突出强调） */
    Primary: '#3c6090',
    PrimaryOn: '#ffffff',
    PrimaryContainer: '#d4e3ff',
    PrimaryContainerOn: '#224876',
    PrimaryFixed: '#0056b3',
    PrimaryFixedOn: '#ffffff',
    PrimaryFixedDim: '#004080',
    PrimaryFixedVariant: '#cfe2ff',
    /** 用于按钮、纸片(Chip)等突出控件，重要程度低于Primary */
    Secondary: '#545f71',
    SecondaryOn: '#ffffff',
    SecondaryContainer: '#d8e3f8',
    SecondaryContainerOn: '#3d4758',
    SecondaryFixed: '#0056b3',
    SecondaryFixedOn: '#ffffff',
    SecondaryFixedDim: '#004080',
    SecondaryFixedVariant: '#cfe2ff',
    /** 用于按钮、纸片(Chip)等突出控件，重要程度和Secondary相同（补充丰富页面色彩，当页面同时出现Primary和Secondary时可以作为中立存在） */
    Tertiary: '#6e5676',
    TertiaryOn: '#ffffff',
    TertiaryContainer: '#f7d8ff',
    TertiaryContainerOn: '#553f5d',
    TertiaryFixed: '#0056b3',
    TertiaryFixedOn: '#ffffff',
    TertiaryFixedDim: '#004080',
    TertiaryFixedVariant: '#cfe2ff',
    /** 用于背景和屏幕上较大、低强调区域的角色。 */
    Surface: '#f9f9ff',
    SurfaceOn: '#191c20',
    SurfaceVariantOn: '#43474e',
    /** 最暗 */
    SurfaceDim: '#d9dae0',
    /** 最亮 */
    SurfaceBright: '#f9f9ff',
    SurfaceContainerLowest: '#ffffff',
    SurfaceContainerLow: '#f3f3fa',
    SurfaceContainer: '#ededf4',
    SurfaceContainerHigh: '#e7e8ee',
    SurfaceContainerHighest: '#e1e2e9',
    /** 边框线 */
    Outline: '#74777f',
    /** 边框线变体，例如分割线 */
    OutlineVariant: '#c3c6cf',
    /** 错误提示 */
    Error: '#ba1a1a',
    ErrorOn: '#ffffff',
    ErrorContainer: '#ffdad6',
    ErrorContainerOn: '#93000a',
    /** 反主题 */
    InverseSurface: '#2e3035',
    InverseSurfaceOn: '#f0f0f7',
    InversePrimary: '#a5c8ff',
    /** 蒙版/遮罩颜色（对话框背景） */
    Scrim: '#000000',
    /** 阴影 */
    Shadow: '#000000',
};