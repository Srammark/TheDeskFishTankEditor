export default class MathX
{
    // Π
    public static readonly PI: number = Math.PI;
    // 角度转弧度的参数
    public static readonly DEG2RAD: number = MathX.PI / 180.0;
    // 弧度转角度的参数
    public static readonly RAD2DEG: number = 180.0 / MathX.PI;
    // 误差（数值判断精度）
    public static EPSILON: number = ((): number =>
    {
        let eps = 0.5;
        while (1 + eps > 1)
        {
            eps *= 0.5;
        }
        return eps;
    })();

    // 绝对值
    public static Abs(v: number): number
    {
        return Math.abs(v);
    }

    // 正弦
    public static Sin(radian: number): number
    {
        return Math.sin(radian);
    }

    // 余弦
    public static Cos(radian: number): number
    {
        return Math.cos(radian);
    }

    // 反余弦
    public static ACos(cos: number): number
    {
        return Math.acos(cos);
    }

    //
    public static Atan2(y: number, x: number): number
    {
        return Math.atan2(y, x);
    }

    // 最大值
    public static Max(a: number, b: number): number;
    public static Max(a: number, b: number, c: number): number;
    public static Max(a: number, b: number, c: number, d: number): number;
    public static Max(...values: number[]): number
    {
        return Math.max(...values);
    }

    // 最小值
    public static Min(a: number, b: number): number;
    public static Min(a: number, b: number, c: number): number;
    public static Min(a: number, b: number, c: number, d: number): number;
    public static Min(...values: number[]): number
    {
        return Math.min(...values);
    }

    // 四舍五入
    public static Round(v: number): number
    {
        return Math.floor(v + 0.5);
    }

    // 四舍五入
    public static Roundf(v: number): number
    {
        return MathX.Floor(v + 0.5);
    }

    // 开方
    public static Sqrt(v: number): number
    {
        return Math.sqrt(v);
    }

    // N次方
    public static Pow(v: number, n: number): number
    {
        return Math.pow(v, n);
    }

    // 平方
    public static Pow2(v: number): number
    {
        return MathX.Pow(v, 2);
    }

    // 两个整数是否相等
    public static Equals(a: number, b: number): boolean
    {
        return a === b;
    }

    // 两个浮点数是否相等
    public static FloatEquals(a: number, b: number): boolean
    {
        return MathX.Abs(a - b) < MathX.EPSILON;
    }

    // 将num限制在[min, max]范围内
    public static Clamp(num: number, min: number, max: number): number
    {
        return MathX.Min(max, MathX.Max(num, min));
    }

    // 将num限制在[0, 1]范围内
    public static Clamp01(num: number): number
    {
        return MathX.Clamp(num, 0, 1);
    }

    // 将angle限制在[0, 360)范围内
    public static Clamp360(angle: number): number
    {
        while (angle < 0)
        {
            angle = 360 + angle;
        }
        while (angle >= 360)
        {
            angle = angle - 360;
        }
        return angle;
    }

    // 获取value的符号
    public static Sign(value: number): number
    {
        return (value >= 0) ? 1 : -1;
    }

    // 获取不大于value的最大整数值
    public static Floor(value: number): number
    {
        return Math.floor(value);
    }

    // 获取不小于value的最小整数值
    public static Ceiling(value: number): number
    {
        return Math.ceil(value);
    }
}
