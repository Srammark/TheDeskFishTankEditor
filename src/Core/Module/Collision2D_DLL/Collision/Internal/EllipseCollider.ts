import Ellipse from '../../Geometry/Ellipse';
import BaseCollider from './BaseCollider';

export default class EllipseCollider extends BaseCollider<Ellipse>
{
    constructor(ellipse: Ellipse)
    {
        super(ellipse);
    }
}
