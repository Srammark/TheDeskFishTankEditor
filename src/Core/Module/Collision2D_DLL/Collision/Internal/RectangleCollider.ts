import Rectangle from '../../Geometry/Rectangle';
import BaseCollider from './BaseCollider';

export default class RectangleCollider extends BaseCollider<Rectangle>
{
    constructor(rectangle: Rectangle)
    {
        super(rectangle);
    }
}
