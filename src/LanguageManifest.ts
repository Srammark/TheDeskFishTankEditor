/// <reference types="@rsbuild/core/types" />

import { EMLanguage } from './Core/IOC_DLL/Interface/I18N/Enum/EMLanguage';
import type { NestedStringObject } from './Core/IOC_DLL/Interface/I18N/IServiceLanguage';

// 自动生成 - 语言包入口映射
// 每个语言一个独立的 chunk，确保相同语言的所有翻译被打包到一个文件中
export const langManifest: Record<EMLanguage, Array<() => Promise<{ default: NestedStringObject }>>> = {
    [EMLanguage.en]: [() => import('./Language/en.ts')],
    [EMLanguage.zh_Hans]: [() => import('./Language/zh-Hans.ts')],
    [EMLanguage.zh_Hant]: [() => import('./Language/zh-Hant.ts')],
} as any;
