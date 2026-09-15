import CoVector2 from '../Math/CoVector2';
import MathX from '../Math/MathX';
import { EMGeometryType } from './GeometryType';
import type IGeometry from './IGeometry';

// 椭圆方程：x²/a²﹢y²/b²=1
export default class Ellipse implements IGeometry
{
    public Width: number;
    public Height: number;

    constructor(width: number = 0, height: number = 0)
    {
        this.Width = width;
        this.Height = height;
    }

    public get A(): number
    {
        return this.Width * 0.5;
    }

    public get B(): number
    {
        return this.Height * 0.5;
    }

    public get Type(): EMGeometryType
    {
        return EMGeometryType.Ellipse;
    }

    public Contains(pt: CoVector2): boolean
    {
        const x2 = MathX.Pow2(pt.X);
        const y2 = MathX.Pow2(pt.Y);
        const a2 = MathX.Pow2(this.A);
        const b2 = MathX.Pow2(this.B);

        return x2 / a2 + y2 / b2 <= 1;
    }

    public GetFarthestProjectionPoint(dir: CoVector2): CoVector2
    {
        let x = 0;
        let y = 0;

        if (MathX.FloatEquals(dir.X, 0.0))
        {
            const sign = dir.Y < 0.0 ? -1 : 1;
            y = sign * this.B;
        }
        else if (MathX.FloatEquals(dir.Y, 0.0))
        {
            const sign = dir.X < 0.0 ? -1 : 1;
            x = sign * this.A;
        }
        else
        {
            const k = dir.Y / dir.X;

            const a2 = MathX.Pow2(this.A);
            const b2 = MathX.Pow2(this.B);
            const k2 = MathX.Pow2(k);

            let t = MathX.Sqrt((a2 + b2 * k2) / k2);
            const v = new CoVector2(0.0, t);
            if (CoVector2.Dot(v, dir) < 0)
            {
                t *= -1;
            }

            x = k * t - (b2 * k2 * k * t) / (a2 + b2 * k2);
            y = (b2 * k2 * t) / (a2 + b2 * k2);
        }

        return new CoVector2(x, y);
    }
}
