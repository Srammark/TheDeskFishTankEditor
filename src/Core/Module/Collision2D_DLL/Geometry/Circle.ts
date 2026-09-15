import CoVector2 from '../Math/CoVector2';
import { EMGeometryType } from './GeometryType';
import type IGeometry from './IGeometry';

// 圆形
export default class Circle implements IGeometry
{
    public Radius: number;

    constructor(radius: number = 0)
    {
        this.Radius = radius;
    }

    public get Type(): EMGeometryType
    {
        return EMGeometryType.Circle;
    }

    public Contains(pt: CoVector2): boolean
    {
        return pt.Magnitude2 <= this.Radius * this.Radius;
    }

    public GetFarthestProjectionPoint(dir: CoVector2): CoVector2
    {
        return CoVector2.MultiplyNumber(dir.Normalized, this.Radius);
    }
}
