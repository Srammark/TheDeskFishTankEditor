export default class EntityPosition
{
    private xPos!: number;
    public get XPos(): number { return this.xPos };
    public set XPos(v: number) { this.xPos = v };

    private yPos!: number;
    public get YPos(): number { return this.yPos };
    public set YPos(v: number) { this.yPos = v };

    private width!: number;
    public get Width(): number { return this.width };
    public set Width(v: number) { this.width = v };

    private height!: number;
    public get Height(): number { return this.height };
    public set Height(v: number) { this.height = v };

    constructor(xPos: number = 0, yPos: number = 0, width: number = 0, height: number = 0)
    {
        this.xPos = xPos;
        this.yPos = yPos;
        this.width = width;
        this.height = height;
    }
}