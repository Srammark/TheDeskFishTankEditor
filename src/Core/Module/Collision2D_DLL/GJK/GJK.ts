import type ICollider from '../Collision/ICollider';
import Circle from '../Geometry/Circle';
import CircleCollider from '../Collision/Internal/CircleCollider';
import GeometryHelper from '../Geometry/Helper/GeometryHelper';
import MathX from '../Math/MathX';
import CoVector2 from '../Math/CoVector2';
import type Transform from '../Transform';
import { EMGeometryType } from '../Geometry/GeometryType';
import EPA from './EPA';
import Minkowski from './Minkowski';
import Penetration from './Penetration';
import Simplex from './Simplex';

export default class GJK
{
    private epaInstance: EPA | null = null;
    private get EPAValue(): EPA
    {
        if (this.epaInstance === null) this.epaInstance = new EPA();
        return this.epaInstance;
    }

    private static readonly MAX_DETECT_ITERATIONS = 100;

    // 检测图形（geometry1, transform1）与图形（geometry2, transform2）是否碰撞
    public Detect(collider1: ICollider, transform1: Transform, collider2: ICollider, transform2: Transform): boolean
    {
        if (collider1.GeometryType === EMGeometryType.Circle && collider2.GeometryType === EMGeometryType.Circle)
        {
            const c1 = collider1 as CircleCollider;
            const c2 = collider2 as CircleCollider;
            return GeometryHelper.IsCircleOverlapsWithCircle(c1.Geometry, transform1, c2.Geometry, transform2);
        }

        const simplex = new Simplex(3);
        const minkowski = new Minkowski(collider1, transform1, collider2, transform2);
        const dir = CoVector2.Subtract(transform1.Position, transform2.Position);

        return this.DetectInternal(simplex, minkowski, dir);
    }

    // 检测图形（geometry1, transform1）与图形（geometry2, transform2）是否碰撞
    // 如果碰撞，则通过 penetration 返回穿透数据
    public DetectWithPenetration(collider1: ICollider, transform1: Transform, collider2: ICollider, transform2: Transform, penetration: Penetration): boolean
    {
        const simplex = new Simplex(3);
        const minkowski = new Minkowski(collider1, transform1, collider2, transform2);
        const dir = CoVector2.Subtract(transform1.Position, transform2.Position);

        if (this.DetectInternal(simplex, minkowski, dir))
        {
            this.EPAValue.CheckPenetration(simplex, minkowski, penetration);
            return true;
        }

        return false;
    }

    // 检测碰撞
    private DetectInternal(simplex: Simplex, minkowski: Minkowski, dir: CoVector2): boolean
    {
        if (dir.Magnitude2 < MathX.EPSILON)
        {
            dir.X = CoVector2.Right.X;
            dir.Y = CoVector2.Right.Y;
        }

        let pt = minkowski.Support(dir);
        simplex.Add(pt);

        if (CoVector2.Dot(pt, dir) <= 0.0)
        {
            return false;
        }

        dir.Negative();

        for (let i = 0; i < GJK.MAX_DETECT_ITERATIONS; i++)
        {
            pt = minkowski.Support(dir);
            simplex.Add(pt);

            if (CoVector2.Dot(pt, dir) <= 0.0)
            {
                return false;
            }

            if (simplex.Check(dir))
            {
                return true;
            }
        }

        return false;
    }
}
