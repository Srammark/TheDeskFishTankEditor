import SubMenu from '../SubMenu';

export default class EventActiveSubMenu
{
    private index!: number;
    public get Index(): number { return this.index };
    public set Index(v: number) { this.index = v };

    private instance: SubMenu | null = null;
    public get Instance(): SubMenu | null { return this.instance };
    public set Instance(v: SubMenu | null) { this.instance = v };
}