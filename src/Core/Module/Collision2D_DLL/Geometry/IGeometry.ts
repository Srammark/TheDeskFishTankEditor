import type CoVector2 from '../Math/CoVector2';
import type { EMGeometryType } from './GeometryType';

// 几何体
// 只包含几何体本身的数据，比如圆形的半径、矩形的长宽等
// 不包含位置、旋转等数据
export default interface IGeometry
{
    readonly Type: EMGeometryType;

    // 是否包含点（pt）
    Contains(pt: CoVector2): boolean;

    // 获取在指定方向（dir）上投影最远的点
    GetFarthestProjectionPoint(dir: CoVector2): CoVector2;
}
