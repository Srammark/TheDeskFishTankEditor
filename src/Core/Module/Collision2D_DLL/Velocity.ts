import CoVector2 from './Math/CoVector2';

export default class Velocity
{
    // 方向
    public Direction: CoVector2;
    // 速率
    public Magnitude: number;

    constructor(direction: CoVector2 = new CoVector2(0, 0), magnitude: number = 0)
    {
        this.Direction = direction;
        this.Magnitude = magnitude;
    }
}
