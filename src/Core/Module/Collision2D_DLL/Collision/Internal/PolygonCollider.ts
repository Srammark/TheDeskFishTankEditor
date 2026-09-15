import Polygon from '../../Geometry/Polygon';
import BaseCollider from './BaseCollider';

export default class PolygonCollider extends BaseCollider<Polygon>
{
    constructor(polygon: Polygon)
    {
        super(polygon);
    }
}
