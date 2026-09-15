import CoVector2 from '../Math/CoVector2';
import MathX from '../Math/MathX';
import type Simplex from './Simplex';
import { EMWindingType } from './WindingType';

export default class ExpandingSimplex
{
    public static Edge = class Edge
    {
        public P1: CoVector2;
        public P2: CoVector2;
        public Normal: CoVector2;
        public Winding: EMWindingType;
        public Distance: number;

        constructor(p1: CoVector2, p2: CoVector2, winding: EMWindingType)
        {
            this.P1 = p1;
            this.P2 = p2;
            this.Winding = winding;

            this.Normal = new CoVector2(p2.X - p1.X, p2.Y - p1.Y);
            if (winding === EMWindingType.Clockwise)
            {
                this.Normal.CW90();
            }
            else
            {
                this.Normal.CCW90();
            }
            this.Normal.Normalize();

            this.Distance = MathX.Abs(p1.X * this.Normal.X + p1.Y * this.Normal.Y);
        }
    };

    public WindingValue: EMWindingType = EMWindingType.Unknown;

    private edges: InstanceType<typeof ExpandingSimplex.Edge>[] = [];

    constructor(simplex: Simplex)
    {
        this.Winding(simplex);
        this.Edges(simplex);
    }

    public GetClosestEdge(): InstanceType<typeof ExpandingSimplex.Edge>
    {
        return this.edges[0];
    }

    public Expand(p: CoVector2): void
    {
        const edge = this.edges[0];
        this.edges.shift();

        const edge1 = new ExpandingSimplex.Edge(edge.P1, p, this.WindingValue);
        const edge2 = new ExpandingSimplex.Edge(p, edge.P2, this.WindingValue);
        this.edges.push(edge1, edge2);

        this.edges.sort((a, b) =>
        {
            if (a.Distance < b.Distance) return -1;
            if (a.Distance > b.Distance) return 1;
            return 0;
        });
    }

    private Winding(simplex: Simplex): void
    {
        const n = simplex.Count;
        for (let i = 0; i < n; i++)
        {
            const p1 = simplex.Get(i);
            const p2 = simplex.Get((i + 1) % n);

            const c = CoVector2.Cross(p1, p2);
            if (c > 0)
            {
                this.WindingValue = EMWindingType.Clockwise;
            }
            else
            {
                this.WindingValue = EMWindingType.CounterClockwise;
            }
        }
    }

    private Edges(simplex: Simplex): void
    {
        const n = simplex.Count;
        for (let i = 0; i < n; i++)
        {
            const p1 = simplex.Get(i);
            const p2 = simplex.Get((i + 1) % n);

            const edge = new ExpandingSimplex.Edge(p1, p2, this.WindingValue);
            this.edges.push(edge);
        }

        this.edges.sort((a, b) =>
        {
            if (a.Distance < b.Distance) return -1;
            if (a.Distance > b.Distance) return 1;
            return 0;
        });
    }
}
