import type { EMConfigurationScope } from './Enum/EMConfigurationScope';
import type { SettingSchema, TypeSettingCategory } from './ISettingItem';
import type ISettingItem from './ISettingItem';

export default interface IServiceSetting
{
    /** 初始化 */
    Init(): Promise<void>;
    /** 注册一个设置项 */
    Register(item: ISettingItem<any>): void;
    /** 通过json对象注册一组设置项 */
    RegisterCategory(item: TypeSettingCategory): void;
    /** 根据ID获取设置项 */
    GetSetting<T extends SettingSchema>(id: string): ISettingItem<T> | undefined;
    /** 设置某个设置项的值 */
    SetValue<T extends SettingSchema>(id: string, value: T, scope: EMConfigurationScope): void;
    /** 获取某个设置项的值 */
    GetValue<T extends SettingSchema>(id: string): T | undefined;
    /** 获取某个类型的所有设置项（比如某个插件） */
    GetByBelongID(belongID: string): ISettingItem<any>[];
    /** 获取全部设置项 */
    GetAll(): ISettingItem<any>[];
}