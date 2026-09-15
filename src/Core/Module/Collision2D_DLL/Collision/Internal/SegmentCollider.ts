import Segment from '../../Geometry/Segment';
import BaseCollider from './BaseCollider';

export default class SegmentCollider extends BaseCollider<Segment>
{
    constructor(segment: Segment)
    {
        super(segment);
    }
}
