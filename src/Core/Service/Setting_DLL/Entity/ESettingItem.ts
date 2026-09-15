
import { Delegate, DelegateEvent } from 'sumi-tsextension';
import { EMControl } from '../../../IOC_DLL/Interface/Setting/Enum/EMControl';
import type ISettingItem from '../../../IOC_DLL/Interface/Setting/ISettingItem';

export type SettingSchema = string | number | boolean | object | null;

/** 设置项类 */
export default class ESettingItem<T extends SettingSchema> implements ISettingItem<T>
{
    protected table = 'setting';
    protected id = '';
    /** 属性唯一标识 */
    public get ID(): string { return this.id; }
    public set ID(v: string) { this.id = v; }

    protected order = -1;
    /** 摆放顺序 越小越前面 */
    public get Order(): number { return this.order; }
    public set Order(v: number)
    {
        if (this.order === v)
        {
            return;
        }

        this.order = v;
    }
    
    protected name = '';
    /** 属性名称（可以使用html标签）*/
    public get Title(): string { return this.name; }
    public set Title(v: string) { this.name = v; }

    protected description = '';
    /** 说明文案（可以使用html标签） */
    public get Description(): string { return this.description; }
    public set Description(v: string) { this.description = v; }

    protected belongID = '';
    /** 属于什么【类型】的设置属性标识 */
    public get BelongID(): string { return this.belongID; }
    public set BelongID(v: string) { this.belongID = v; }

    protected belongName = '';
    /** 类型名称 */
    public get BelongName(): string { return this.belongName; }
    public set BelongName(v: string) { this.belongName = v; }

    protected controlType = EMControl.None;
    /** 控件类型 */
    public get ControlType(): EMControl { return this.controlType; }
    public set ControlType(v: EMControl) { this.controlType = v; }

    protected value!: T;
    /** 值 */
    public get Value(): T { return this.value; }
    public set Value(v: T)
    {
        if (this.value === v)
        {
            return;
        }

        this.value = v;
        this.dChange.InvokeAsync();
    }

    protected minNum: number = 0;
    /** 当类型为number时，最小值 */
    public get MinNum(): number { return this.minNum; }
    public set MinNum(v: number)
    {
        if (this.minNum === v)
        {
            return;
        }

        this.minNum = v;
    }

    protected maxNum: number = 0;
    /** 当类型为number时，最大值 */
    public get MaxNum(): number { return this.maxNum; }
    public set MaxNum(v: number)
    {
        if (this.maxNum === v)
        {
            return;
        }

        this.maxNum = v;
    }

    protected maxLength: number = 0;
    /** 当类型为string时，最大字符串长度 */
    public get MaxLength(): number { return this.maxLength; }
    public set MaxLength(v: number)
    {
        if (this.maxLength === v)
        {
            return;
        }

        this.maxLength = v;
    }

    protected dChange = new Delegate();
    /** value变更事件 */
    public get DChange(): DelegateEvent<(v: T) => void> { return this.dChange.Event; }

    protected static readonly ALLOWED_TYPES = ['string', 'number', 'boolean', 'object'];

    constructor(init?: Partial<ISettingItem<T>>)
    {
        if (!!init === true)
        {
            this.id = init.ID ?? '';
            this.order = init.Order ?? 0;
            this.name = init.Title ?? '';
            this.description = init.Description ?? '';
            this.order = init.Order ?? 0;
            this.belongID = init.BelongID ?? '';
            this.belongName = init.BelongName ?? '';
            this.controlType = init.ControlType ?? EMControl.None;
            this.value = (init.Value === undefined ? (null as unknown as T) : init.Value);
            this.minNum = init.MinNum ?? 0;
            this.maxNum = init.MaxNum ?? 0;
            this.maxLength = init.MaxLength ?? 0;
        }
    }
}