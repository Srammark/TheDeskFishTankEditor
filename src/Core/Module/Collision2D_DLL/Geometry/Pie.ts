import CoVector2 from '../Math/CoVector2';
import MathX from '../Math/MathX';
import Matrix from '../Math/Matrix';
import { EMGeometryType } from './GeometryType';
import type IGeometry from './IGeometry';

// 扇形
export default class Pie implements IGeometry
{
    public Radius: number;
    public Sweep: number;

    constructor(radius: number = 0, sweep: number = 0)
    {
        this.Radius = radius;
        this.Sweep = sweep;
    }

    public get Type(): EMGeometryType
    {
        return EMGeometryType.Pie;
    }

    public Contains(pt: CoVector2): boolean
    {
        if (pt.Magnitude2 > this.Radius * this.Radius)
        {
            return false;
        }

        pt.Y = MathX.Abs(pt.Y);
        const a0 = pt.Angle() * MathX.RAD2DEG;
        const a1 = MathX.Clamp360(this.Sweep * 0.5);

        return a0 <= a1;
    }

    public GetFarthestProjectionPoint(dir: CoVector2): CoVector2
    {
        const s = MathX.Sign(dir.Y);

        dir.Y = MathX.Abs(dir.Y);
        const a0 = dir.Angle() * MathX.RAD2DEG;
        const a1 = MathX.Clamp360(this.Sweep * 0.5);

        let pt = CoVector2.Zero;
        if (a0 <= a1)
        {
            pt = CoVector2.MultiplyNumber(dir.Normalized, this.Radius);
        }
        else if (a0 <= 90 + a1)
        {
            const mt = Matrix.CreateRotationMatrix(a1 * MathX.DEG2RAD);
            pt = CoVector2.MultiplyNumber(Matrix.Transform(CoVector2.Right, mt), this.Radius);
        }
        pt.Y *= s;

        return pt;
    }
}
