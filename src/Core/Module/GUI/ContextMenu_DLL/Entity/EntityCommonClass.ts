export default class EntityCommon
{
    private menu!: string;
    public get Menu(): string { return this.menu };
    public set Menu(v: string) { this.menu = v };

    private menuItem!: string;
    public get MenuItem(): string { return this.menuItem };
    public set MenuItem(v: string) { this.menuItem = v };

    private menuItemClickable!: string;
    public get MenuItemClickable(): string { return this.menuItemClickable };
    public set MenuItemClickable(v: string) { this.menuItemClickable = v };

    private menuItemUnclickable!: string;
    public get MenuItemUnclickable(): string { return this.menuItemUnclickable };
    public set MenuItemUnclickable(v: string) { this.menuItemUnclickable = v };
}