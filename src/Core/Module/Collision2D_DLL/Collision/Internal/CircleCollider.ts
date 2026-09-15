import AABB from '../../BoundingBox/AABB';
import Circle from '../../Geometry/Circle';
import BaseCollider from './BaseCollider';

export default class CircleCollider extends BaseCollider<Circle>
{
    constructor(circle: Circle)
    {
        super(circle);
    }

    public override RefreshGeometry(_rotation: number): void
    {
        const circle = this.GeometryValue;

        this.BoundingBoxValue = new AABB(-circle.Radius, -circle.Radius, circle.Radius, circle.Radius);
    }
}
