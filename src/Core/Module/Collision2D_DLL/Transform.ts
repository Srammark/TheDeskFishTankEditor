import CoVector2 from './Math/CoVector2';

export default class Transform
{
    /// <summary>
    /// 位置
    /// </summary>
    public Position: CoVector2;
    /// <summary>
    /// 旋转
    /// </summary>
    public Rotation: number;
    /// <summary>
    /// 缩放
    /// </summary>
    public Scale: number;

    constructor(position: CoVector2 = CoVector2.Zero, rotation: number = 0, scale: number = 1)
    {
        this.Position = position;
        this.Rotation = rotation;
        this.Scale = scale;
    }

    public Move(delta: CoVector2): void
    {
        this.Position = this.Position.Add(delta);
    }

    public Rotate(delta: number): void
    {
        this.Rotation += delta;
    }
}
