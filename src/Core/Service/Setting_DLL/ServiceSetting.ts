import IOC from '../../../Core/IOC_DLL/IOC';
import Sym from '../../../Core/IOC_DLL/Sym';
import Path from '../../../Core/Module/String_DLL/Path';
import { type SettingSchema } from './Entity/ESettingItem';
import PlatformInfo from '../../../Core/Module/Platform_DLL/PlatformInfo';
import { URI } from '../../../Core/Module/String_DLL/URI';
import MAUI from '../../../Core/Module/MAUI_DLL/MAUI';
import type IServiceSetting from '../../../Core/IOC_DLL/Interface/Setting/IServiceSetting';
import { type TypeSettingCategory, type default as ISettingItem } from '../../../Core/IOC_DLL/Interface/Setting/ISettingItem';
import type IServiceFile from '../../../Core/IOC_DLL/Interface/File/IServiceFile';
import { EMConfigurationScope } from '../../../Core/IOC_DLL/Interface/Setting/Enum/EMConfigurationScope';

/**
 * 设置管理服务
 * 用于注册、查找、遍历所有设置项。
 * 不负责实际持久化（那是 ASettingItem 的职责）。
 */
export default class ServiceSetting implements IServiceSetting
{
    private sFile!: IServiceFile;
    private workspacePath?: URI;
    private userConfigPath!: URI;
    private workspaceConfigPath?: URI;
    private registeredItemMap: Map<string, ISettingItem<any>> = new Map();
    private userSettings: Record<string, any> = {};
    private workspaceSettings: Record<string, any> = {};

    /** 初始化 */
    public async Init(): Promise<void>
    {
        this.sFile = IOC.Get<IServiceFile>(Sym.ServiceFile);

        if (PlatformInfo.IsMaui === true)
        {
            const appDataPath = await MAUI.DotNetInvokeMethod<string>('FileModule_GetAppDataPath');
            this.userConfigPath = URI.File(Path.Join(appDataPath, '/user/settings.json'));
        }
        else
        {
            this.userConfigPath = URI.Parse('indexedDB:///theDeskFishTankEditor/user/settings.json');
        }

        // 用户配置
        this.userSettings = await this.ReadConfig(this.userConfigPath);

        // 工作区配置
        if (!!this.workspaceConfigPath === true)
        {
            this.workspaceSettings = await this.ReadConfig(this.workspaceConfigPath);
        }

        // 初始化每个设置项
        for (const item of this.registeredItemMap.values())
        {
            const val = this.GetValue(item.ID);
            if (val !== undefined)
            {
                item.Value = val;
            }
        }
    }

    /** 注册单个设置项 */
    public Register(item: ISettingItem<any>): void
    {
        this.registeredItemMap.set(item.ID, item);
        
        const configValue = this.GetValue(item.ID);
        if (configValue !== undefined)
        {
            item.Value = configValue;
        }
    }

    /** 注册一组设置项 */
    public RegisterCategory(category: TypeSettingCategory): void
    {
        
    }

    /** 获取某个设置项 */
    public GetSetting<T extends SettingSchema>(id: string): ISettingItem<T> | undefined
    {
        return this.registeredItemMap.get(id);
    }

    /** 获取所有设置项 */
    public GetAll(): ISettingItem<any>[]
    {
        return [...this.registeredItemMap.values()];
    }

    /** 获取某个模块/插件的设置项 */
    public GetByBelongID(belongID: string): ISettingItem<any>[]
    {
        return [...this.registeredItemMap.values()].filter(x => x.BelongID === belongID);
    }

    /** 初始化配置文件与已注册设置项 */
    public async InitAll(): Promise<void>
    {
       
    }

    /** 获取值（优先工作区） */
    public GetValue<T extends SettingSchema>(id: string): T | undefined
    {
        if (id in this.workspaceSettings)
        {
            return this.workspaceSettings[id];
        }
        if (id in this.userSettings)
        {
            return this.userSettings[id];
        }

        return this.registeredItemMap.get(id)?.Value ?? undefined;
    }

    /** 设置值（根据作用域写入文件） */
    public async SetValue<T extends SettingSchema>(id: string, value: T, scope: EMConfigurationScope): Promise<void>
    {
        const item = this.registeredItemMap.get(id);
        if (!item)
        {
            throw new Error(`Setting item not found: ${id}`);
        }

        item.Value = value;

        if (scope === EMConfigurationScope.Workspace)
        {
            if (!this.workspaceConfigPath)
            {
                throw new Error('Workspace path not set.');
            }
            this.workspaceSettings[id] = value;
            await this.SaveConfig(this.workspaceConfigPath, this.workspaceSettings);
        }
        else
        {
            this.userSettings[id] = value;
            await this.SaveConfig(this.userConfigPath, this.userSettings);
        }
    }

    /** 安全读取配置文件（不存在则返回空对象） */
    private async ReadConfig(uri: URI): Promise<Record<string, any>>
    {
        if (await this.sFile.Exists(uri))
        {
            const buf = await this.sFile.ReadFile(uri);
            try
            {
                return JSON.parse(buf?.toString() ?? '{}');
            }
            catch
            {
                return {};
            }
        }

        return {};
    }

    /** 保存配置文件 */
    private async SaveConfig(uri: URI, data: Record<string, any>): Promise<void>
    {
        await this.EnsureDirExists(uri);
        await this.sFile.WriteFile(uri, JSON.stringify(data, null, 4));
    }

    /** 确保目录存在 */
    private async EnsureDirExists(uri: URI): Promise<void>
    {
        if (!(await this.sFile.Exists(uri)))
        {
            await this.sFile.MKDir(uri);
        }
    }
}