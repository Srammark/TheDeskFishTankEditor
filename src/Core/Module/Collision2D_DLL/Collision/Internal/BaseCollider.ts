import AABB from '../../BoundingBox/AABB';
import type { EMGeometryType } from '../../Geometry/GeometryType';
import type IGeometry from '../../Geometry/IGeometry';
import GeometryHelper from '../../Geometry/Helper/GeometryHelper';
import MathX from '../../Math/MathX';
import CoVector2 from '../../Math/CoVector2';
import type Transform from '../../Transform';
import type ICollider from '../ICollider';

export default abstract class BaseCollider<T extends IGeometry> implements ICollider
{
    // 几何体
    protected GeometryValue: T;
    // 包围盒
    protected BoundingBoxValue: AABB = new AABB();

    // 主方向
    protected static readonly CARDINAL_DIRS: CoVector2[] = [
        CoVector2.Up,
        CoVector2.Right,
        CoVector2.Down,
        CoVector2.Left,
    ];

    protected constructor(geometry: T)
    {
        this.GeometryValue = geometry;
    }

    // 几何体类型
    public get GeometryType(): EMGeometryType
    {
        return this.GeometryValue.Type;
    }

    // 包围盒
    public get BoundingBox(): AABB
    {
        return this.BoundingBoxValue;
    }

    // 几何体
    public get Geometry(): T
    {
        return this.GeometryValue;
    }

    // 刷新几何信息
    public RefreshGeometry(rotation: number): void
    {
        const p1 = this.GetFarthestProjectionPoint(rotation, BaseCollider.CARDINAL_DIRS[0]);
        const p2 = this.GetFarthestProjectionPoint(rotation, BaseCollider.CARDINAL_DIRS[1]);
        const p3 = this.GetFarthestProjectionPoint(rotation, BaseCollider.CARDINAL_DIRS[2]);
        const p4 = this.GetFarthestProjectionPoint(rotation, BaseCollider.CARDINAL_DIRS[3]);
        // 设置包围盒
        this.BoundingBoxValue.Set(
            MathX.Min(p1.X, p2.X, p3.X, p4.X),
            MathX.Min(p1.Y, p2.Y, p3.Y, p4.Y),
            MathX.Max(p1.X, p2.X, p3.X, p4.X),
            MathX.Max(p1.Y, p2.Y, p3.Y, p4.Y));
    }

    // 获取在指定方向（dir）上投影最远的点
    public GetFarthestProjectionPoint(rotation: number, dir: CoVector2): CoVector2
    {
        return GeometryHelper.GetFarthestProjectionPointByRotation(this.GeometryValue, rotation, dir);
    }

    // 获取在指定方向（dir）上投影最远的点
    public GetFarthestProjectionPointByTransform(transform: Transform, dir: CoVector2): CoVector2
    {
        return GeometryHelper.GetFarthestProjectionPointByTransform(this.GeometryValue, transform, dir);
    }
}
