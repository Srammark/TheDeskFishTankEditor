import CoVector2 from '../Math/CoVector2';
import { EMGeometryType } from './GeometryType';
import type IGeometry from './IGeometry';

// 凸多边形
export default class Polygon implements IGeometry
{
    public Vertics: CoVector2[];

    constructor(vertics: CoVector2[] = [])
    {
        this.Vertics = vertics;
    }

    public get Type(): EMGeometryType
    {
        return EMGeometryType.Polygon;
    }

    public Contains(pt: CoVector2): boolean
    {
        const n = this.Vertics.length;

        let u = CoVector2.Subtract(this.Vertics[n - 1], pt);
        let v = CoVector2.Subtract(this.Vertics[0], pt);
        let z = CoVector2.Cross(u, v);

        for (let i = 0; i < n - 1; i++)
        {
            u = CoVector2.Subtract(this.Vertics[i], pt);
            v = CoVector2.Subtract(this.Vertics[i + 1], pt);
            const w = CoVector2.Cross(u, v);

            if (z * w < 0) return false;
        }

        return true;
    }

    public GetFarthestProjectionPoint(dir: CoVector2): CoVector2
    {
        let point = this.Vertics[0];
        let max = CoVector2.Dot(point, dir);

        for (let i = 1; i < this.Vertics.length; i++)
        {
            const dot = CoVector2.Dot(this.Vertics[i], dir);
            if (dot > max)
            {
                max = dot;
                point = this.Vertics[i];
            }
        }

        return point;
    }
}
