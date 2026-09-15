import Pie from '../../Geometry/Pie';
import BaseCollider from './BaseCollider';

export default class PieCollider extends BaseCollider<Pie>
{
    constructor(pie: Pie)
    {
        super(pie);
    }
}
