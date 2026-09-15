import CoVector2 from '../Math/CoVector2';
import { EMGeometryType } from './GeometryType';
import type IGeometry from './IGeometry';
import GeometryHelper from './Helper/GeometryHelper';

// 胶囊
export default class Capsule implements IGeometry
{
    public Length: number;
    public Radius: number;

    constructor(length: number = 0, radius: number = 0)
    {
        this.Length = length;
        this.Radius = radius;
    }

    public get Type(): EMGeometryType
    {
        return EMGeometryType.Capsule;
    }

    public Contains(pt: CoVector2): boolean
    {
        const p1 = new CoVector2(this.Length * 0.5, 0);
        const p2 = new CoVector2(this.Length * -0.5, 0);

        const dist2 = GeometryHelper.GetDistance2ToSegment(p1, p2, pt);
        const radius2 = this.Radius * this.Radius;

        return dist2 <= radius2;
    }

    public GetFarthestProjectionPoint(dir: CoVector2): CoVector2
    {
        const p = CoVector2.MultiplyNumber(dir.Normalized, this.Radius);
        const x = dir.X >= 0 ? this.Length * 0.5 : -this.Length * 0.5;
        p.X += x;

        return p;
    }
}
