
import { Delegate, DelegateEvent } from 'sumi-tsextension';
import type { IJSONSchema, SchemaToType } from '../../../../Core/Module/Json_DLL/JsonSchema';
import { EMControl } from './Enum/EMControl';

// 单个设置项 Schema
const JSchemaSettingItem = {
    title: 'TypeSettingItem',
    type: 'object',
    required: ['id', 'title', 'type'],
    properties: {
        id: { type: 'string' },
        order: { type: 'number' },
        title: { type: 'string' },
        type: {
            enum: ['string', 'number', 'integer', 'boolean', 'null', 'array', 'object'],
        },
        schema: {
            oneOf: [
                { type: 'string' },
                { type: 'object' },
            ],
        },
        description: { type: 'string' },
        ControlType: { enum: ['None', 'CheckBox', 'SelectBox', 'InputBox', 'InputNumBox'] },
    },
    additionalProperties: false,
} as const satisfies IJSONSchema;

/** 大分类 */
export const JSchemaSettingCategory = {
    title: 'TypeSettingCategory',
    type: 'array',
    items: {
        type: 'object',
        required: ['categoryID', 'categoryName', 'list'],
        properties: {
            categoryID: { type: 'string' },
            categoryName: { type: 'string' },
            list: {
                type: 'array',
                items: JSchemaSettingItem,
            },
        },
        additionalProperties: false,
    },
} as const satisfies IJSONSchema;

export type TypeSettingCategory = SchemaToType<typeof JSchemaSettingCategory>;

export type SettingSchema = string | number | boolean | object | null;

/** 设置项抽象类 */
export default interface ISettingItem<T extends SettingSchema>
{
    set ID(v: string);

    /** 摆放顺序 越小越前面 */
    get Order(): number;
    set Order(v: number);
    
    /** 属性名称*/
    get Title(): string;
    set Title(v: string);

    /** 说明文案 */
    get Description(): string;
    set Description(v: string);

    /** 属于什么【类型】的设置属性标识 */
    get BelongID(): string;
    set BelongID(v: string);

    /** 类型名称 */
    get BelongName(): string;
    set BelongName(v: string);

    /** 控件类型 */
    get ControlType(): EMControl;
    set ControlType(v: EMControl);

    /** 值 */
    get Value(): T;
    set Value(v: T);

    /** 当类型为number时，最小值 */
    get MinNum(): number;
    set MinNum(v: number);

    /** 当类型为number时，最大值 */
    get MaxNum(): number;
    set MaxNum(v: number);
    /** 当类型为string时，最大字符串长度 */
    get MaxLength(): number;
    set MaxLength(v: number);

    /** value变更事件 */
    get DChange(): DelegateEvent<(v: T) => void>;
}