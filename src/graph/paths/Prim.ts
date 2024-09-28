import Vertex from '../Vertex';
import Edge from '../Edge';
import getCanvas from '../../graph-ui/canvas/canvas';

export class Prim {
    graph: { [key: string]: Vertex };

    constructor(graph: { [key: string]: Vertex }) {
        this.graph = graph;
    }
    execute(coordenadaA: string) {
        const mstEdges: Edge[] = [];
        const visited: Set<string> = new Set();
        const edges: Edge[] = [];

        visited.add(coordenadaA);
        edges.push(...this.graph[coordenadaA].getNeighbors());

        while (edges.length > 0) {
            edges.sort((a, b) => (a.getWeight() || Infinity) - (b.getWeight() || Infinity));
            const edge = edges.shift();
            if (!edge) break;

            const destination = edge.getDestination(); 
            if (!visited.has(destination.label)) {
                mstEdges.push(edge);
                visited.add(destination.label);
                edges.push(...destination.getNeighbors());
            }
        }

        return mstEdges;
    }

    paintMST(mstEdges: Edge[]) {
        const ctx = getCanvas().getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 1;

        for (const edge of mstEdges) {
            const source = edge.getSource();
            const destination = edge.getDestination();
            ctx.beginPath();
            ctx.moveTo(source.getX(), source.getY());
            ctx.lineTo(destination.getX(), destination.getY());
            ctx.stroke();
        }
    }
}
