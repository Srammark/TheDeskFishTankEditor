import type ICollider from './Collision/ICollider';
import type IGeometry from './Geometry/IGeometry';
import Transform from './Transform';

export default class CoShape2D
{
    /// <summary>
    /// 形状
    /// </summary>
    public Geometry: IGeometry | null;
    /// <summary>
    /// 碰撞体
    /// </summary>
    public Collider: ICollider | null;
    /// <summary>
    /// 位置
    /// </summary>
    public Transform: Transform;

    constructor()
    {
        this.Geometry = null;
        this.Collider = null;
        this.Transform = new Transform();
    }
}
