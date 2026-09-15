import { EMControl } from '../../../../Core/IOC_DLL/Interface/Setting/Enum/EMControl';
import ESettingItem from '../../Setting_DLL/Entity/ESettingItem';

/** 原色 */
export default class SettingSourceColor extends ESettingItem<string>
{
    protected id = 'core.setting.appearance.sourceColor';
    protected name = 'core.setting.item.sourceColor.name';
    protected description = 'core.setting.item.sourceColor.content';
    protected belongID = 'core.setting.appearance';
    protected belongName = 'core.setting.belong.name.appearance';
    protected controlType = EMControl.None;
    protected value: string = '#4B7CBD';
}