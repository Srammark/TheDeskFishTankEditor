import CoVector2 from './CoVector2';
import MathX from './MathX';

export default class Matrix
{
    public m11: number;
    public m12: number;
    public m13: number;
    public m21: number;
    public m22: number;
    public m23: number;
    public m31: number;
    public m32: number;
    public m33: number;

    constructor(m11: number, m12: number, m13: number,
        m21: number, m22: number, m23: number,
        m31: number, m32: number, m33: number)
    {
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m21 = m21;
        this.m22 = m22;
        this.m23 = m23;
        this.m31 = m31;
        this.m32 = m32;
        this.m33 = m33;
    }

    public static Copy(matrix: Matrix): Matrix
    {
        return new Matrix(
            matrix.m11, matrix.m12, matrix.m13,
            matrix.m21, matrix.m22, matrix.m23,
            matrix.m31, matrix.m32, matrix.m33
        );
    }

    public static Multiply(a: Matrix, b: Matrix): Matrix
    {
        const m11 = a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31;
        const m12 = a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32;
        const m13 = a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33;
        const m21 = a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31;
        const m22 = a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32;
        const m23 = a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33;
        const m31 = a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31;
        const m32 = a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32;
        const m33 = a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33;

        return new Matrix(m11, m12, m13,
            m21, m22, m23,
            m31, m32, m33);
    }

    public static CreateTranslationMatrix(p: CoVector2): Matrix
    {
        return Matrix.CreateTranslationMatrixXY(p.X, p.Y);
    }

    public static CreateTranslationMatrixXY(x: number, y: number): Matrix
    {
        const matrix = new Matrix(1, 0, 0,
            0, 1, 0,
            x, y, 1);
        return matrix;
    }

    public static CreateRotationMatrix(radian: number): Matrix
    {
        const s = MathX.Sin(radian);
        const c = MathX.Cos(radian);

        const matrix = new Matrix(c, s, 0,
            -s, c, 0,
            0, 0, 1);
        return matrix;
    }

    public static Transform(vector: CoVector2, matrix: Matrix): CoVector2
    {
        const x = ((vector.X * matrix.m11) + (vector.Y * matrix.m21)) + (vector.W * matrix.m31);
        const y = ((vector.X * matrix.m12) + (vector.Y * matrix.m22)) + (vector.W * matrix.m32);

        return new CoVector2(x, y);
    }
}
