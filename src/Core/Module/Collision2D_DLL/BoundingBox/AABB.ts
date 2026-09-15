// AABB 的几何数据，不包含位置信息
export default class AABB
{
    public MinX: number;
    public MinY: number;
    public MaxX: number;
    public MaxY: number;

    constructor(minx: number = 0, miny: number = 0, maxx: number = 0, maxy: number = 0)
    {
        this.MinX = minx;
        this.MinY = miny;
        this.MaxX = maxx;
        this.MaxY = maxy;
    }

    public get Width(): number
    {
        return this.MaxX - this.MinX;
    }

    public get Height(): number
    {
        return this.MaxY - this.MinY;
    }

    public Set(minx: number, miny: number, maxx: number, maxy: number): void
    {
        this.MinX = minx;
        this.MinY = miny;
        this.MaxX = maxx;
        this.MaxY = maxy;
    }
}
