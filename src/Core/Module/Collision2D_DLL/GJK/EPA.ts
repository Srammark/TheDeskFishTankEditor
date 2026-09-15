import MathX from '../Math/MathX';
import CoVector2 from '../Math/CoVector2';
import ExpandingSimplex from './ExpandingSimplex';
import type Minkowski from './Minkowski';
import type Penetration from './Penetration';
import type Simplex from './Simplex';

export default class EPA
{
    private static readonly MAX_ITERATIONS = 100;

    public CheckPenetration(simplex: Simplex, minkowski: Minkowski, penetration: Penetration): void
    {
        const expandingSimplex = new ExpandingSimplex(simplex);
        let edge = new ExpandingSimplex.Edge(CoVector2.Zero, CoVector2.Zero, 0);
        let point = CoVector2.Zero;

        for (let i = 0; i < EPA.MAX_ITERATIONS; i++)
        {
            edge = expandingSimplex.GetClosestEdge();
            point = minkowski.Support(edge.Normal);

            const projection = CoVector2.Dot(point, edge.Normal);
            if (projection - edge.Distance < MathX.EPSILON)
            {
                penetration.Normal.X = edge.Normal.X;
                penetration.Normal.Y = edge.Normal.Y;
                penetration.Depth = projection;

                return;
            }

            expandingSimplex.Expand(point);
        }

        penetration.Normal.X = edge.Normal.X;
        penetration.Normal.Y = edge.Normal.Y;
        penetration.Depth = CoVector2.Dot(point, edge.Normal);
    }
}
