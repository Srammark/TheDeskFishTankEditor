export default class EntityStyle
{
    private top!: number;
    public get Top(): number { return this.top };
    public set Top(v: number) { this.top = v };

    private left!: number;
    public get Left(): number { return this.left };
    public set Left(v: number) { this.left = v };

    private zIndex!: number;
    public get ZIndex(): number { return this.zIndex };
    public set ZIndex(v: number) { this.zIndex = v };

    private minWidth!: number;
    public get MinWidth(): number { return this.minWidth };
    public set MinWidth(v: number) { this.minWidth = v };

    constructor(top: number = 0, left: number = 0, zIndex: number = 99999, minWidth: number = 150)
    {
        this.top = top;
        this.left = left;
        this.zIndex = zIndex;
        this.minWidth = minWidth;
    }
}