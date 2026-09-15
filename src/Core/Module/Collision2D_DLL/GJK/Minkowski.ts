import type ICollider from '../Collision/ICollider';
import CoVector2 from '../Math/CoVector2';
import type Transform from '../Transform';

export default class Minkowski
{
    private collider1: ICollider;
    private transform1: Transform;
    private collider2: ICollider;
    private transform2: Transform;

    constructor(collider1: ICollider, transform1: Transform, collider2: ICollider, transform2: Transform)
    {
        this.collider1 = collider1;
        this.transform1 = transform1;
        this.collider2 = collider2;
        this.transform2 = transform2;
    }

    public Support(dir: CoVector2): CoVector2
    {
        const p1 = this.collider1.GetFarthestProjectionPointByTransform(this.transform1, dir);
        dir.Negative();
        const p2 = this.collider2.GetFarthestProjectionPointByTransform(this.transform2, dir);

        return CoVector2.Subtract(p1, p2);
    }
}
