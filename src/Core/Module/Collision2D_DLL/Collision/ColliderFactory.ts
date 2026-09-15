import Capsule from '../Geometry/Capsule';
import Circle from '../Geometry/Circle';
import Ellipse from '../Geometry/Ellipse';
import type IGeometry from '../Geometry/IGeometry';
import Pie from '../Geometry/Pie';
import Polygon from '../Geometry/Polygon';
import Rectangle from '../Geometry/Rectangle';
import Segment from '../Geometry/Segment';
import type Transform from '../Transform';
import type ICollider from './ICollider';
import CapsuleCollider from './Internal/CapsuleCollider';
import CircleCollider from './Internal/CircleCollider';
import EllipseCollider from './Internal/EllipseCollider';
import PieCollider from './Internal/PieCollider';
import PolygonCollider from './Internal/PolygonCollider';
import RectangleCollider from './Internal/RectangleCollider';
import SegmentCollider from './Internal/SegmentCollider';

export default class ColliderFactory
{
    // 创建碰撞器
    public static CreateCollider(geometry: IGeometry): ICollider | null
    {
        if (geometry instanceof Circle)
            return new CircleCollider(geometry);
        if (geometry instanceof Rectangle)
            return new RectangleCollider(geometry);
        if (geometry instanceof Capsule)
            return new CapsuleCollider(geometry);
        if (geometry instanceof Polygon)
            return new PolygonCollider(geometry);
        if (geometry instanceof Ellipse)
            return new EllipseCollider(geometry);
        if (geometry instanceof Pie)
            return new PieCollider(geometry);
        if (geometry instanceof Segment)
            return new SegmentCollider(geometry);

        return null;
    }

    // 创建圆形碰撞器
    public static CreateCircleCollider(circle: Circle): ICollider
    {
        return new CircleCollider(circle);
    }

    // 创建圆形碰撞器
    public static CreateCircleColliderWithTransform(circle: Circle, transform: Transform): ICollider
    {
        const collider = new CircleCollider(circle);
        collider.RefreshGeometry(transform.Rotation);

        return collider;
    }

    // 创建矩形碰撞器
    public static CreateRectangleCollider(rectangle: Rectangle): ICollider
    {
        return new RectangleCollider(rectangle);
    }

    // 创建矩形碰撞器
    public static CreateRectangleColliderWithTransform(rectangle: Rectangle, transform: Transform): ICollider
    {
        const collider = new RectangleCollider(rectangle);
        collider.RefreshGeometry(transform.Rotation);

        return collider;
    }

    // 创建胶囊碰撞器
    public static CreateCapsuleCollider(capsule: Capsule): ICollider
    {
        return new CapsuleCollider(capsule);
    }

    // 创建胶囊碰撞器
    public static CreateCapsuleColliderWithTransform(capsule: Capsule, transform: Transform): ICollider
    {
        const collider = new CapsuleCollider(capsule);
        collider.RefreshGeometry(transform.Rotation);

        return collider;
    }

    // 创建凸多边形碰撞器
    public static CreatePolygonCollider(polygon: Polygon): ICollider
    {
        return new PolygonCollider(polygon);
    }

    // 创建凸多边形碰撞器
    public static CreatePolygonColliderWithTransform(polygon: Polygon, transform: Transform): ICollider
    {
        const collider = new PolygonCollider(polygon);
        collider.RefreshGeometry(transform.Rotation);

        return collider;
    }

    // 创建椭圆碰撞器
    public static CreateEllipseCollider(ellipse: Ellipse): ICollider
    {
        return new EllipseCollider(ellipse);
    }

    // 创建椭圆碰撞器
    public static CreateEllipseColliderWithTransform(ellipse: Ellipse, transform: Transform): ICollider
    {
        const collider = new EllipseCollider(ellipse);
        collider.RefreshGeometry(transform.Rotation);

        return collider;
    }

    // 创建扇形碰撞器
    public static CreatePieCollider(pie: Pie): ICollider
    {
        return new PieCollider(pie);
    }

    // 创建扇形碰撞器
    public static CreatePieColliderWithTransform(pie: Pie, transform: Transform): ICollider
    {
        const collider = new PieCollider(pie);
        collider.RefreshGeometry(transform.Rotation);

        return collider;
    }

    // 创建线段碰撞器
    public static CreateSegmentCollider(segment: Segment): ICollider
    {
        return new SegmentCollider(segment);
    }

    // 创建线段碰撞器
    public static CreateSegmentColliderWithTransform(segment: Segment, transform: Transform): ICollider
    {
        const collider = new SegmentCollider(segment);
        collider.RefreshGeometry(transform.Rotation);

        return collider;
    }
}
