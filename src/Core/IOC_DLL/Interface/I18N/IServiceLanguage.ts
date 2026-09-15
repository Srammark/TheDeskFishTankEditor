import { type I18n } from 'vue-i18n';
import type { DelegateEvent } from 'sumi-tsextension';
import type { EMLanguage } from './Enum/EMLanguage';

export type TypeLocaleKey = string;

export type NestedStringObject<T = string> = { [key: string]: T | NestedStringObject<T>; };

/**
 * 高性能深度合并：
 * - 字符串直接覆盖
 * - 对象则递归合并
 * - 如果目标缺少对象层级，会自动创建
 */
export function MergeNestedStringObject(target: NestedStringObject, source: NestedStringObject): void
{
    for (const key in source)
    {
        const s = source[key];
        const t = target[key];

        if (s && typeof s === 'object')
        {
            if (t && typeof t === 'object')
            {
                // 两边都是对象 → 递归合并
                MergeNestedStringObject(t as NestedStringObject, s as NestedStringObject);
            }
            else
            {
                // 目标缺少对象 → 创建空对象后合并（不直接引用源对象）
                const newObj: NestedStringObject = {};
                MergeNestedStringObject(newObj, s as NestedStringObject);
                target[key] = newObj;
            }
        }
        else
        {
            // s 是字符串（或其他原始类型）→ 覆盖
            target[key] = s;
        }
    }
}

export default interface IServiceLanguage
{
    get NowLanguage(): EMLanguage;
    get I18n(): I18n;
    get DLanguageChange(): DelegateEvent<() => void>;
    Init(): I18n;
    /** 添加语言包(此时没有进行加载) */
    AddLanguagePackage(lang: EMLanguage, pack: () => Promise<{ default: NestedStringObject }>): void
    /** 加载语言包 */
    LoadLanguagePackage(lang: EMLanguage): Promise<void>
    /** 添加语言内容 */
    AddLanguage(lang: EMLanguage, obj: NestedStringObject): void
    /** 切换语言 */
    ChangeLanguage(lang: EMLanguage): Promise<void>
    /** 翻译 */
    T(key: string, args?: Record<string, unknown>): string
}