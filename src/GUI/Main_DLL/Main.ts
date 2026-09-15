import { Container } from 'inversify';
import IOC from '@/Core/IOC_DLL/IOC';
import Sym from '@/Core/IOC_DLL/Sym';
import type IServiceFile from '@/Core/IOC_DLL/Interface/File/IServiceFile';
import type IServiceLog from '@/Core/IOC_DLL/Interface/Log/IServiceLog';
import ServiceFile from '@/Core/Service/File_DLL/ServiceFile';
import ServiceLog from '@/Core/Service/Log_DLL/ServiceLog';
import type IServiceTheme from '@/Core/IOC_DLL/Interface/Theme/IServiceTheme';
import type IServiceSetting from '@/Core/IOC_DLL/Interface/Setting/IServiceSetting';
import ServiceSetting from '@/Core/Service/Setting_DLL/ServiceSetting';
import ServiceTheme from '@/Core/Service/Theme_DLL/ServiceTheme';
import PlatformInfo from '@/Core/Module/Platform_DLL/PlatformInfo';
import { configure, InMemory } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { Schemas } from '@/Core/Module/String_DLL/Schemas';
import FileSystemIndexedDB from '@/Core/Service/File_DLL/ItemFolder/IndexedDB/FileSystemIndexedDB';
import FileSystemDevice from '@/Core/Service/File_DLL/ItemFolder/Device/FileSystemDevice';
import FileSystemHtml from '@/Core/Service/File_DLL/ItemFolder/Html/FileSystemHtml';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import ServiceLanguage from '@/Core/Service/I18N_DLL/ServiceLanguage';
import { EMLanguage } from '@/Core/IOC_DLL/Interface/I18N/Enum/EMLanguage';

export default class Main
{
    public async Init(): Promise<void>
    {
        IOC.SetContainer(new Container());
        this.CreateServices();
        await this.RegisterFileSystem();
        this.InitTheme();
        await this.InitLanguage();
    }

    private CreateServices(): void
    {
        IOC.SetSingletonScope<IServiceLog>(Sym.ServiceLog, ServiceLog);
        IOC.SetSingletonScope<IServiceLanguage>(Sym.ServiceLanguage, ServiceLanguage);
        IOC.SetSingletonScope<IServiceFile>(Sym.ServiceFile, ServiceFile);
        IOC.SetSingletonScope<IServiceTheme>(Sym.ServiceTheme, ServiceTheme);
        IOC.SetSingletonScope<IServiceSetting>(Sym.ServiceSetting, ServiceSetting);
    }

    private async InitLanguage(): Promise<void>
    {
        IOC.Get<IServiceLanguage>(Sym.ServiceLanguage).Init();
        await IOC.Get<IServiceLanguage>(Sym.ServiceLanguage).ChangeLanguage(EMLanguage.zh_Hans);
    }

    private InitTheme(): void
    {
        const sTheme = IOC.Get<IServiceTheme>(Sym.ServiceTheme);
        sTheme.ChangeSourceColor(IOC.Get<IServiceSetting>(Sym.ServiceSetting).GetValue<string>('core.setting.appearance.sourceColor')!, true);
    }

    private async RegisterFileSystem(): Promise<void>
    {
        await configure({
            mounts: {
                '/memory': InMemory,
                '/theDeskFishTankEditor': IndexedDB,
            }
        });
        IOC.Get<IServiceFile>(Sym.ServiceFile).RegisterFileSystem(Schemas.indexedDB, new FileSystemIndexedDB());
        if (PlatformInfo.IsMaui === true)
        {
            // MAUI 环境使用 FileSystemDevice 处理本地文件系统
            IOC.Get<IServiceFile>(Sym.ServiceFile).RegisterFileSystem(Schemas.file, new FileSystemDevice());
        }
        else
        {
            // Web 环境使用 FileSystemHtml（HTML5 FileSystem Access API）
            IOC.Get<IServiceFile>(Sym.ServiceFile).RegisterFileSystem(Schemas.file, new FileSystemHtml());
        }
    }
}