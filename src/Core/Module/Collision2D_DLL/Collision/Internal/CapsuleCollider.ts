import Capsule from '../../Geometry/Capsule';
import BaseCollider from './BaseCollider';

export default class CapsuleCollider extends BaseCollider<Capsule>
{
    constructor(capsule: Capsule)
    {
        super(capsule);
    }
}
