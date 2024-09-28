import Vertex from '../Vertex';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';
import MinHeap from './MinHeap';

export const Dijkstra = async (source: Vertex, destination: Vertex) => {
    const distances: Record<string, number> = {};
    const previous: Record<string, Vertex | null> = {};
    const minHeap = new MinHeap();

    distances[source.label] = 0;
    minHeap.insertar(source, 0);

    const ctx = getCanvas().getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    console.time('tiempo de ejecucion de Dijkstra es:');
    while (!minHeap.isEmpty()) {
        const current = minHeap.extraerMinimo();
        if (!current) break;

        const { vertex: currentVertex, distance: currentDistance } = current;

        currentVertex.paint(currentVertex.getX(), currentVertex.getY(), ctx);
        await delay(1);

        currentVertex.getNeighbors().forEach(async edge => {
            const neighbor = edge.destination;
            const weight = edge.weight;
            if (neighbor) {
                const newDistance = currentDistance + (weight || 0);

                if (newDistance < (distances[neighbor.label] || Infinity)) {
                    distances[neighbor.label] = newDistance;
                    previous[neighbor.label] = currentVertex;
                    minHeap.insertar(neighbor, newDistance);

                    currentVertex.drawEdge(currentVertex, neighbor, ctx);
                    await delay(1);
                }
            }
        });

        if (currentVertex === destination) break;
    }
    console.timeEnd('tiempo de ejecucion de Dijkstra es:');

    let current = destination;
    while (previous[current.label] !== null) {
        const prevVertex = previous[current.label];
        if (prevVertex) {
            prevVertex.drawEdge(prevVertex, current, ctx, 'green');
            await delay(1);
            current = prevVertex;
        }
    }

    return { distances, previous };
};
