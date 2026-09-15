import CoVector2 from '../Math/CoVector2';

export default class Penetration
{
    public Normal: CoVector2;
    public Depth: number;

    constructor(normal: CoVector2 = CoVector2.Zero, depth: number = 0)
    {
        this.Normal = normal;
        this.Depth = depth;
    }

    public Clear(): void
    {
        this.Normal = CoVector2.Zero;
        this.Depth = 0;
    }
}
