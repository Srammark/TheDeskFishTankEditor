import CoVector2 from '../Math/CoVector2';
import MathX from '../Math/MathX';

export default class Simplex
{
    private vertics: CoVector2[];

    public get Count(): number
    {
        return this.vertics.length;
    }

    private get A(): CoVector2
    {
        return this.vertics[this.Count - 1];
    }

    private set A(value: CoVector2)
    {
        this.vertics[this.Count - 1] = value;
    }

    private get B(): CoVector2
    {
        return this.vertics[this.Count - 2];
    }

    private set B(value: CoVector2)
    {
        this.vertics[this.Count - 2] = value;
    }

    private get C(): CoVector2
    {
        return this.vertics[this.Count - 3];
    }

    private set C(value: CoVector2)
    {
        this.vertics[this.Count - 3] = value;
    }

    constructor(count: number)
    {
        this.vertics = [];
        this.vertics.length = count;
    }

    public Get(index: number): CoVector2
    {
        return this.vertics[index];
    }

    public Add(point: CoVector2): void
    {
        this.vertics.push(point);
    }

    // 检测是否包含原点
    // 包含则返回true；否则返回false，并返回下一次迭代所需的方向向量
    public Check(dir: CoVector2): boolean
    {
        const ao = CoVector2.Negate(this.A);
        const ab = CoVector2.Subtract(this.B, this.A);

        if (this.Count === 2)
        {
            const result = CoVector2.Mul3(ab, ao, ab);
            dir.X = result.X;
            dir.Y = result.Y;
            if (dir.Magnitude2 < MathX.EPSILON)
            {
                const perp = ab.Perpendicular;
                dir.X = perp.X;
                dir.Y = perp.Y;
            }
        }
        else if (this.Count === 3)
        {
            const ac = CoVector2.Subtract(this.C, this.A);
            const v = CoVector2.Mul3(ab, ac, ac);

            if (CoVector2.Dot(v, ao) >= 0.0)
            {
                dir.X = v.X;
                dir.Y = v.Y;
            }
            else
            {
                const u = CoVector2.Mul3(ac, ab, ab);
                if (CoVector2.Dot(u, ao) < 0.0)
                {
                    return true;
                }

                this.C = this.B;
                dir.X = u.X;
                dir.Y = u.Y;
            }

            this.B = this.A;
            this.vertics.splice(this.Count - 1, 1); // remove 'a'
        }

        return false;
    }
}
