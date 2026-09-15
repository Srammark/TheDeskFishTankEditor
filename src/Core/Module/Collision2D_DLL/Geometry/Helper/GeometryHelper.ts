import type AABB from '../../BoundingBox/AABB';
import CoVector2 from '../../Math/CoVector2';
import MathX from '../../Math/MathX';
import Matrix from '../../Math/Matrix';
import type Transform from '../../Transform';
import type Circle from '../Circle';
import type IGeometry from '../IGeometry';
import type Polygon from '../Polygon';
import type Rectangle from '../Rectangle';

export default class GeometryHelper
{
    // 获取两点间距离的平方
    public static GetDistance2(a: CoVector2, b: CoVector2): number
    {
        const dx = a.X - b.X;
        const dy = a.Y - b.Y;

        return dx * dx + dy * dy;
    }

    // 获取点（pt）到线段（pa，pb）的最小距离的平方
    public static GetDistance2ToSegment(pa: CoVector2, pb: CoVector2, pt: CoVector2): number
    {
        const px = pt.X - pa.X;
        const py = pt.Y - pa.Y;
        const xx = pb.X - pa.X;
        const yy = pb.Y - pa.Y;
        const h = MathX.Clamp((px * xx + py * yy) / (xx * xx + yy * yy), 0.0, 1.0);
        const dx = px - xx * h;
        const dy = py - yy * h;

        return dx * dx + dy * dy;
    }

    // 获取矩形（x, y, width, height, rotation）的顶点
    public static GetRectanglePoints(width: number, height: number, rotation: number): CoVector2[]
    {
        const w = width * 0.5;
        const h = height * 0.5;

        const p1 = new CoVector2(-w, -h);
        const p2 = new CoVector2(w, -h);
        const p3 = new CoVector2(w, h);
        const p4 = new CoVector2(-w, h);

        const mt = Matrix.CreateRotationMatrix(rotation * MathX.DEG2RAD);

        return [
            Matrix.Transform(p1, mt),
            Matrix.Transform(p2, mt),
            Matrix.Transform(p3, mt),
            Matrix.Transform(p4, mt),
        ];
    }

    // 获取胶囊（length, rotation）的端点
    public static GetCapsulePoints(length: number, rotation: number): CoVector2[]
    {
        const mt = Matrix.CreateRotationMatrix(rotation * MathX.DEG2RAD);

        let p1 = new CoVector2(length * 0.5, 0);
        p1 = Matrix.Transform(p1, mt);

        let p2 = new CoVector2(length * -0.5, 0);
        p2 = Matrix.Transform(p2, mt);

        return [p1, p2];
    }

    // 图形（geometry)是否包含点（pt)
    public static Contains(geometry: IGeometry, transform: Transform, pt: CoVector2): boolean
    {
        const m1 = Matrix.CreateTranslationMatrix(CoVector2.Negate(transform.Position));
        const m2 = Matrix.CreateRotationMatrix(-transform.Rotation * MathX.DEG2RAD);
        const mt = Matrix.Multiply(m1, m2);
        pt = Matrix.Transform(pt, mt);

        return geometry.Contains(pt);
    }

    // 圆（pa, ra)是否和圆（pb, rb）重叠
    public static IsCircleOverlapsWithCircle(circle1: Circle, transform1: Transform, circle2: Circle, transform2: Transform): boolean
    {
        const d2 = GeometryHelper.GetDistance2(transform1.Position, transform2.Position);
        const r2 = (circle1.Radius + circle2.Radius) * (circle1.Radius + circle2.Radius);

        return d2 <= r2;
    }

    // 圆（circle）是否和矩形（rectangle)重叠
    public static IsCircleOverlapsWithRectangle(circle: Circle, circleTransform: Transform, rectangle: Rectangle, rectangleTransform: Transform): boolean
    {
        const m = Matrix.CreateRotationMatrix(rectangleTransform.Rotation * MathX.DEG2RAD * -1);
        let v = CoVector2.Subtract(circleTransform.Position, rectangleTransform.Position);

        v = Matrix.Transform(v, m);
        v.X = MathX.Abs(v.X);
        v.Y = MathX.Abs(v.Y);

        const h = new CoVector2(rectangle.Width * 0.5, rectangle.Height * 0.5);
        const u = CoVector2.Subtract(v, h);

        u.X = MathX.Max(0, u.X);
        u.Y = MathX.Max(0, u.Y);

        return u.Magnitude2 <= circle.Radius * circle.Radius;
    }

    // 两个矩形是否重叠
    public static IsRectangleOverlapsWithRectangle(rectangle1: Rectangle, transform1: Transform, rectangle2: Rectangle, transform2: Transform): boolean
    {
        if (!GeometryHelper.IsRectangleProjectionOverlaps(rectangle1, transform1, rectangle2, transform2)) return false;
        if (!GeometryHelper.IsRectangleProjectionOverlaps(rectangle2, transform2, rectangle1, transform1)) return false;

        return true;
    }

    // 圆形（circle）和多边形（polygon）是否重叠
    public static IsPolygonOverlapsWithCircle(circle: Circle, circleTransform: Transform, polygon: Polygon, polygonTransform: Transform): boolean
    {
        const r2 = circle.Radius * circle.Radius;

        const n = polygon.Vertics.length;
        for (let i = 0; i < n; i++)
        {
            const p1 = CoVector2.Subtract(polygon.Vertics[i], polygonTransform.Position);
            const p2 = CoVector2.Subtract(polygon.Vertics[(i + 1) % n], polygonTransform.Position);

            const d2 = GeometryHelper.GetDistance2ToSegment(p1, p2, circleTransform.Position);
            if (d2 <= r2) return true;
        }

        return GeometryHelper.Contains(polygon, polygonTransform, circleTransform.Position);
    }

    // 矩形投影是否重叠
    private static IsRectangleProjectionOverlaps(rectangle1: Rectangle, transform1: Transform, rectangle2: Rectangle, transform2: Transform): boolean
    {
        const w = rectangle1.Width * 0.5;
        const h = rectangle1.Height * 0.5;

        const m1 = Matrix.CreateTranslationMatrix(CoVector2.Negate(transform1.Position));
        const m2 = Matrix.CreateRotationMatrix(transform1.Rotation * MathX.DEG2RAD * -1);
        const mt = Matrix.Multiply(m1, m2);

        const ps = GeometryHelper.GetRectanglePoints(rectangle2.Width, rectangle2.Height, transform2.Rotation);
        const p5 = CoVector2.Add(transform2.Position, Matrix.Transform(ps[0], mt));
        const p6 = CoVector2.Add(transform2.Position, Matrix.Transform(ps[1], mt));
        const p7 = CoVector2.Add(transform2.Position, Matrix.Transform(ps[2], mt));
        const p8 = CoVector2.Add(transform2.Position, Matrix.Transform(ps[3], mt));

        const x1 = MathX.Min(p5.X, p6.X, p7.X, p8.X);
        const x2 = MathX.Max(p5.X, p6.X, p7.X, p8.X);
        const y1 = MathX.Min(p5.Y, p6.Y, p7.Y, p8.Y);
        const y2 = MathX.Max(p5.Y, p6.Y, p7.Y, p8.Y);

        if (x2 < -w || x1 > w) return false;
        if (y2 < -h || y1 > h) return false;

        return true;
    }

    // 线段（p1, p2）是否和线段（q1, q2）相交
    public static IsSegmentsIntersected(p1: CoVector2, p2: CoVector2, q1: CoVector2, q2: CoVector2): boolean
    {
        const a1 = CoVector2.Subtract(p1, q2);
        const b1 = CoVector2.Subtract(p2, p2);
        const c1 = CoVector2.Subtract(q1, q2);
        if (CoVector2.Cross(a1, c1) * CoVector2.Cross(b1, c1) > 0) return false;

        const a2 = CoVector2.Subtract(q2, p2);
        const b2 = CoVector2.Subtract(q1, p2);
        const c2 = CoVector2.Subtract(p1, p2);
        if (CoVector2.Cross(a2, c2) * CoVector2.Cross(b2, c2) > 0) return false;

        return true;
    }

    // 获取图形（geomotry）旋转（rotation）后在给定方向（dir）上最大投影的点
    public static GetFarthestProjectionPointByRotation<T extends IGeometry>(geometry: T, rotation: number, dir: CoVector2): CoVector2
    {
        const m1 = Matrix.CreateRotationMatrix(-rotation * MathX.DEG2RAD);
        dir = Matrix.Transform(dir, m1);

        const pt = geometry.GetFarthestProjectionPoint(dir);

        const m2 = Matrix.CreateRotationMatrix(rotation * MathX.DEG2RAD);
        return Matrix.Transform(pt, m2);
    }

    // 获取图形（geomotry）变化（transform）后在给定方向（dir）上最大投影的点
    public static GetFarthestProjectionPointByTransform<T extends IGeometry>(geometry: T, transform: Transform, dir: CoVector2): CoVector2
    {
        const m1 = Matrix.CreateRotationMatrix(-transform.Rotation * MathX.DEG2RAD);
        dir = Matrix.Transform(dir, m1);

        const pt = geometry.GetFarthestProjectionPoint(dir);

        const m2 = Matrix.CreateRotationMatrix(transform.Rotation * MathX.DEG2RAD);
        const m3 = Matrix.CreateTranslationMatrix(transform.Position);

        return Matrix.Transform(pt, Matrix.Multiply(m2, m3));
    }
}
