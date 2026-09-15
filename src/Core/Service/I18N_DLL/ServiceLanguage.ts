import { createI18n, type Composer, type I18n } from 'vue-i18n';
import { EMLanguage } from '../../IOC_DLL/Interface/I18N/Enum/EMLanguage';
import SettingLanguage from './Setting/SettingLanguage';
import { Delegate, DelegateEvent } from 'sumi-tsextension';
import IOC from '../../IOC_DLL/IOC';
import Sym from '../../IOC_DLL/Sym';
import type ServiceSetting from '../../../Core/Service/Setting_DLL/ServiceSetting';
import type IServiceLanguage from "../../../Core/IOC_DLL/Interface/I18N/IServiceLanguage";
import { MergeNestedStringObject, type NestedStringObject } from '../../../Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import type IServiceLog from '../../../Core/IOC_DLL/Interface/Log/IServiceLog';
import { langManifest } from '../../../LanguageManifest';

/** 国际化管理类 */
export default class ServiceLanguage implements IServiceLanguage
{
    private langList: {[key: string]: NestedStringObject } = {};
    private nowLanguage = EMLanguage.zh_Hans;
    /** 当前语言 */
    public get NowLanguage(): EMLanguage { return this.nowLanguage; }
    private i18n!: I18n;
    public get I18n(): I18n { return this.i18n; }
    private dLanguageChange = new Delegate();
    public get DLanguageChange() { return this.dLanguageChange.Event; }

    private settingLanguage = new SettingLanguage();
    private languagePackageMap = new Map<EMLanguage, Array<() => Promise<{ default: NestedStringObject }>>>();

    constructor()
    {
        for (const [lang, packs] of Object.entries(langManifest))
        {
            for (const pack of packs)
            {
                this.AddLanguagePackage(lang as EMLanguage, pack);
            }
        }

        IOC.Get<ServiceSetting>(Sym.ServiceSetting).Register(this.settingLanguage);
    }

    /** 添加语言包(此时没有进行加载) */
    public AddLanguagePackage(lang: EMLanguage, pack: () => Promise<{ default: NestedStringObject }>): void
    {
        if (this.languagePackageMap.has(lang) === false)
        {
            this.languagePackageMap.set(lang, []);
        }

        const list = this.languagePackageMap.get(lang);
        if (list!.indexOf(pack) === -1)
        {
            list!.push(pack);
        }
    }

    public async LoadLanguagePackage(lang: EMLanguage): Promise<void>
    {
        const list = this.languagePackageMap.get(lang);
        if (!!list === false)
        {
            return;
        }

        try
        {
            for (const pack of list)
            {
                const module = await pack();
                this.AddLanguage(lang, module.default);
            }
        }
        catch (error)
        {
            IOC.Get<IServiceLog>(Sym.ServiceLog).Error(`${this.T('core.service.language.error.loadLanguagePackageError')}`, error);
        }
    }

    /** 添加语言 */
    public AddLanguage(lang: string, obj: NestedStringObject): void
    {
        const existing = this.langList[lang];
        if (!!existing === true)
        {
            MergeNestedStringObject(existing, obj);
        }
        else
        {
            this.langList[lang] = obj;
        }
    }

    public Init(): I18n
    {
        this.nowLanguage = this.settingLanguage.Value;
        this.i18n = createI18n({
            globalInjection: true,
            // 回退语言
            fallbackLocale: 'en',
            locale: this.nowLanguage,
            messages: this.langList as any,
            legacy: false
        });

        return this.i18n;
    }

    public async ChangeLanguage(lang: EMLanguage): Promise<void>
    {
        this.nowLanguage = lang;
        await this.LoadLanguagePackage(lang);
        this.i18n.global.locale = lang;
        this.i18n.global.setLocaleMessage(lang, this.langList[lang]);
        this.settingLanguage.Value = lang;
        await this.dLanguageChange.InvokeAsync();
    }
    
    public T(key: string, args?: Record<string, unknown>): string
    {
        const composer = this.i18n.global as Composer;
        return args ? composer.t(key, args) : composer.t(key);
    }
}