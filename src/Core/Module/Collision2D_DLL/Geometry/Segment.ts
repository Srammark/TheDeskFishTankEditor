import CoVector2 from '../Math/CoVector2';
import MathX from '../Math/MathX';
import { EMGeometryType } from './GeometryType';
import type IGeometry from './IGeometry';

// 线段
export default class Segment implements IGeometry
{
    public Length: number;
    public Normal: CoVector2;

    constructor(length: number = 0, normal: CoVector2 = CoVector2.Zero)
    {
        this.Length = length;
        this.Normal = normal;
    }

    public get Type(): EMGeometryType
    {
        return EMGeometryType.Segment;
    }

    public Contains(pt: CoVector2): boolean
    {
        const pa = new CoVector2(this.Length * 0.5, 0);
        const pb = new CoVector2(this.Length * -0.5, 0);

        const t = CoVector2.Dot(CoVector2.Subtract(pa, pt), CoVector2.Subtract(pb, pt));
        return MathX.FloatEquals(t, -1.0);
    }

    public GetFarthestProjectionPoint(dir: CoVector2): CoVector2
    {
        return (dir.X >= 0) ? new CoVector2(this.Length * 0.5, 0) : new CoVector2(this.Length * -0.5, 0);
    }
}
