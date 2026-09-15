import type Matrix from './Matrix';
import MathX from './MathX';

export default class CoVector2
{
    public X: number;
    public Y: number;
    public readonly W: number;

    public static readonly Zero: CoVector2 = new CoVector2(0, 0);
    public static readonly One: CoVector2 = new CoVector2(1, 1);
    public static readonly Left: CoVector2 = new CoVector2(-1, 0);
    public static readonly Right: CoVector2 = new CoVector2(1, 0);
    public static readonly Up: CoVector2 = new CoVector2(0, -1);
    public static readonly Down: CoVector2 = new CoVector2(0, 1);

    constructor(x: number, y: number)
    {
        this.X = x;
        this.Y = y;
        this.W = 1;
    }

    // 向量的模
    public get Magnitude(): number
    {
        return MathX.Sqrt(this.Magnitude2);
    }

    // 向量模的平方
    public get Magnitude2(): number
    {
        return this.X * this.X + this.Y * this.Y;
    }

    // 获得归一化后的单位向量
    public get Normalized(): CoVector2
    {
        const m = this.Magnitude;
        const u = this.X / m;
        const v = this.Y / m;
        return new CoVector2(u, v);
    }

    // 反向向量
    public get Negatived(): CoVector2
    {
        return new CoVector2(-this.X, -this.Y);
    }

    public get Perpendicular(): CoVector2
    {
        return this.PerpendicularVector();
    }

    // 取反
    public Negative(): void
    {
        this.X *= -1;
        this.Y *= -1;
    }

    // 归一化
    public Normalize(): void
    {
        const m = this.Magnitude;
        this.X = this.X / m;
        this.Y = this.Y / m;
    }

    // 归一化
    public static Normalize(v: CoVector2): CoVector2
    {
        return v.Normalized;
    }

    // 归一化
    public static NormalizeXY(x: number, y: number): CoVector2
    {
        const v = new CoVector2(x, y);
        return v.Normalized;
    }

    // 垂直向量
    public PerpendicularVector(): CoVector2
    {
        return CoVector2.PerpendicularXY(this.X, this.Y);
    }

    // 垂直向量
    public static Perpendicular(v: CoVector2): CoVector2
    {
        return CoVector2.PerpendicularXY(v.X, v.Y);
    }

    // 垂直向量
    public static PerpendicularXY(x: number, y: number): CoVector2
    {
        return new CoVector2(y, -x);
    }

    // 两点间的距离
    public Distance(v: CoVector2): number
    {
        return CoVector2.Distance(this, v);
    }

    // 两点间的距离
    public static Distance(a: CoVector2, b: CoVector2): number
    {
        const d = CoVector2.Distance2(a, b);
        return MathX.Sqrt(d);
    }

    // 两点间距离的平方
    public Distance2(v: CoVector2): number
    {
        return CoVector2.Distance2(this, v);
    }

    // 两点间距离的平方
    public static Distance2(a: CoVector2, b: CoVector2): number
    {
        const dx = a.X - b.X;
        const dy = a.Y - b.Y;
        return dx * dx + dy * dy;
    }

    // 向量点乘
    public Dot(v: CoVector2): number
    {
        return CoVector2.Dot(this, v);
    }

    // 向量点乘
    public static Dot(a: CoVector2, b: CoVector2): number
    {
        return a.X * b.X + a.Y * b.Y;
    }

    // 向量叉乘
    // 在2D中，向量叉乘没有意义。但为了方便某些计算，定义了叉乘。由W分量表示Z轴
    public Cross(v: CoVector2): number
    {
        return CoVector2.Cross(this, v);
    }

    // 向量叉乘
    public static Cross(a: CoVector2, b: CoVector2): number
    {
        return a.X * b.Y - a.Y * b.X;
    }

    // 向量三重积
    public static Mul3(a: CoVector2, b: CoVector2, c: CoVector2): CoVector2
    {
        const ac = a.X * c.X + a.Y * c.Y; // a.dot(c)
        const bc = b.X * c.X + b.Y * c.Y; // b.dot(c)

        // b * a.dot(c) - a * b.dot(c)
        const x = b.X * ac - a.X * bc;
        const y = b.Y * ac - a.Y * bc;

        return new CoVector2(x, y);
    }

    // 向量与X轴的夹角，弧度
    public Angle(): number
    {
        return this.AngleTo(CoVector2.Right);
    }

    // 向量夹角，弧度
    public AngleTo(v: CoVector2): number
    {
        return CoVector2.Angle(this, v);
    }

    // 向量夹角，弧度
    public static Angle(a: CoVector2, b: CoVector2): number
    {
        const u = a.Normalized;
        const v = b.Normalized;
        const d = CoVector2.Dot(u, v);

        return MathX.ACos(d);
    }

    public Theta(): number
    {
        return MathX.Atan2(this.Y, this.X);
    }

    // 反射向量
    public static Reflect(input: CoVector2, normal: CoVector2): CoVector2
    {
        const I = input;
        const N = normal.Normalized;
        const R = I.Subtract(CoVector2.MultiplyNumber(N, 2 * CoVector2.Dot(I, N)));

        return R.Normalized;
    }

    public CW90(): void
    {
        const t = this.X;
        this.X = -this.Y;
        this.Y = t;
    }

    public CCW90(): void
    {
        const t = this.X;
        this.X = t;
        this.Y = -t;
    }

    // 向量加法
    public Add(v: CoVector2): CoVector2
    {
        return new CoVector2(this.X + v.X, this.Y + v.Y);
    }

    // 向量减法
    public Subtract(v: CoVector2): CoVector2
    {
        return new CoVector2(this.X - v.X, this.Y - v.Y);
    }

    // 向量乘以标量
    public Multiply(k: number): CoVector2
    {
        return new CoVector2(this.X * k, this.Y * k);
    }

    // 向量除以标量
    public Divide(k: number): CoVector2
    {
        return new CoVector2(this.X / k, this.Y / k);
    }

    // 反向向量
    public static Negate(v: CoVector2): CoVector2
    {
        return new CoVector2(-v.X, -v.Y);
    }

    // 向量加法
    public static Add(a: CoVector2, b: CoVector2): CoVector2
    {
        return new CoVector2(a.X + b.X, a.Y + b.Y);
    }

    // 向量减法
    public static Subtract(a: CoVector2, b: CoVector2): CoVector2
    {
        return new CoVector2(a.X - b.X, a.Y - b.Y);
    }

    // 向量乘以标量
    public static MultiplyNumber(v: CoVector2, k: number): CoVector2
    {
        return new CoVector2(v.X * k, v.Y * k);
    }

    // 标量乘以向量
    public static NumberMultiply(k: number, v: CoVector2): CoVector2
    {
        return CoVector2.MultiplyNumber(v, k);
    }

    // 向量除以标量
    public static DivideNumber(v: CoVector2, k: number): CoVector2
    {
        return new CoVector2(v.X / k, v.Y / k);
    }

    // 通过矩阵M变换向量V
    public static Transform(v: CoVector2, m: Matrix): CoVector2
    {
        const x = v.X * m.m11 + v.Y * m.m21;
        const y = v.X * m.m12 + v.Y * m.m22;

        return new CoVector2(x, y);
    }
}
