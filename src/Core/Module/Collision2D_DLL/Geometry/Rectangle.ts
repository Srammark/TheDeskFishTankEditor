import CoVector2 from '../Math/CoVector2';
import { EMGeometryType } from './GeometryType';
import type IGeometry from './IGeometry';

// 矩形
export default class Rectangle implements IGeometry
{
    public Width: number;
    public Height: number;

    constructor(width: number = 0, height: number = 0)
    {
        this.Width = width;
        this.Height = height;
    }

    public get Type(): EMGeometryType
    {
        return EMGeometryType.Rectangle;
    }

    public Contains(pt: CoVector2): boolean
    {
        const w = this.Width * 0.5;
        const h = this.Height * 0.5;

        if (pt.X < -w || pt.X > w) return false;
        if (pt.Y < -h || pt.Y > h) return false;

        return true;
    }

    public GetFarthestProjectionPoint(dir: CoVector2): CoVector2
    {
        const w = this.Width * 0.5;
        const h = this.Height * 0.5;

        const vertics: CoVector2[] = [
            new CoVector2(-w, -h),
            new CoVector2(w, -h),
            new CoVector2(w, h),
            new CoVector2(-w, h),
        ];

        let point = vertics[0];
        let max = CoVector2.Dot(point, dir);

        for (let i = 1; i < vertics.length; i++)
        {
            const dot = CoVector2.Dot(vertics[i], dir);
            if (dot > max)
            {
                max = dot;
                point = vertics[i];
            }
        }

        return point;
    }
}
