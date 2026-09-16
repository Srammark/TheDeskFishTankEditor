
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
    protected value: EMLanguage = SettingLanguage.GetSystemLanguage();

    /** 根据用户电脑的系统语言获取默认语言 */
    private static GetSystemLanguage(): EMLanguage
    {
        const lang = navigator.language.toLowerCase();
        if (lang.startsWith('zh') === true)
        {
            // 繁体：显式标注 Hant，或台湾、香港、澳门地区
            if (lang.includes('hant') === true || lang.endsWith('-tw') === true || lang.endsWith('-hk') === true || lang.endsWith('-mo') === true)
            {
                return EMLanguage.zh_Hant;
            }

            return EMLanguage.zh_Hans;
        }

        return EMLanguage.en;
    }
}