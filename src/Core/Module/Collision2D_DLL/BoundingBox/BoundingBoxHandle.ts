import type AABB from './AABB';
import type CoVector2 from '../Math/CoVector2';
import type Transform from '../Transform';

export default class BoundingBoxHandle
{
    /// <summary>
    /// 点是否在包围盒内
    /// </summary>
    public static Contains(boundingBox: AABB, transform: Transform, pt: CoVector2): boolean
    {
        const minx = boundingBox.MinX + transform.Position.X;
        const miny = boundingBox.MinY + transform.Position.Y;
        const maxx = boundingBox.MaxX + transform.Position.X;
        const maxy = boundingBox.MaxY + transform.Position.Y;

        return minx <= pt.X && maxx >= pt.X && miny <= pt.Y && maxy >= pt.Y;
    }

    /// <summary>
    /// 重叠检测
    /// </summary>
    public static Overlaps(boundingBox1: AABB, transform1: Transform, boundingBox2: AABB, transform2: Transform): boolean
    {
        const minx1 = boundingBox1.MinX + transform1.Position.X;
        const miny1 = boundingBox1.MinY + transform1.Position.Y;
        const maxx1 = boundingBox1.MaxX + transform1.Position.X;
        const maxy1 = boundingBox1.MaxY + transform1.Position.Y;

        const minx2 = boundingBox2.MinX + transform2.Position.X;
        const miny2 = boundingBox2.MinY + transform2.Position.Y;
        const maxx2 = boundingBox2.MaxX + transform2.Position.X;
        const maxy2 = boundingBox2.MaxY + transform2.Position.Y;

        if (minx1 > maxx2 || maxx1 < minx2) return false;
        if (miny1 > maxy2 || maxy1 < miny2) return false;

        return true;
    }
}
