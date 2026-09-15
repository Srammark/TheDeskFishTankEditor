
import { EMControl } from '../../../../Core/IOC_DLL/Interface/Setting/Enum/EMControl';
import ESettingItem from '../../Setting_DLL/Entity/ESettingItem';
import { EMLanguage } from '../../../IOC_DLL/Interface/I18N/Enum/EMLanguage';

export default class SettingLanguage extends ESettingItem<EMLanguage>
{
    protected id = 'core.setting.other:Language';
    protected name = 'core.setting.item.language.name';
    protected description = 'core.setting.item.language.content';
    protected belongID = 'core.setting.other';
    protected belongName = 'core.setting.belong.name.other';
    protected controlType = EMControl.SelectBox;
    protected value: EMLanguage = EMLanguage.zh_Hans;
}