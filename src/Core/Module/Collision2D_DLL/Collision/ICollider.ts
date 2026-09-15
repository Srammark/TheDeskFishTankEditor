import type AABB from '../BoundingBox/AABB';
import type CoVector2 from '../Math/CoVector2';
import type { EMGeometryType } from '../Geometry/GeometryType';
import type Transform from '../Transform';

export default interface ICollider
{
    // 几何体类型
    readonly GeometryType: EMGeometryType;
    // 包围盒
    readonly BoundingBox: AABB;

    // 刷新几何信息
    RefreshGeometry(rotation: number): void;

    // 获取在指定方向（dir）上投影最远的点
    GetFarthestProjectionPoint(rotation: number, dir: CoVector2): CoVector2;

    // 获取在指定方向（dir）上投影最远的点
    GetFarthestProjectionPointByTransform(transform: Transform, dir: CoVector2): CoVector2;
}
