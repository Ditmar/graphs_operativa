import Vertex from '../Vertex';
import { getCanvasForeground } from '../../graph-ui/canvas/canvas';
import { delay, drawEdge } from '../../graph-ui/utils';
import MinHeap from './MinHeap';

export const Dijkstra = async (source: Vertex, destination: Vertex) => {
    if(source == destination){
        alert("same origin and destination");
        return;
    }
    const distances: Record<string, number> = {};
    const previous: Record<string, Vertex | null> = {};
    const minHeap = new MinHeap();

    distances[source.label] = 0;
    minHeap.insert(source, 0);
    const ctx = getCanvasForeground().getContext('2d');

    if (ctx === null) {
        throw new Error('Failed to get 2D context');
    }

    while (!minHeap.isEmpty()) {
        const current = minHeap.extractMin();
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
                    minHeap.insert(neighbor, newDistance);
                    drawEdge(currentVertex, neighbor, ctx);
                    await delay(1);
                }
            }
        });
        if (currentVertex === destination) break;
    }
    ctx.clearRect(0, 0, getCanvasForeground().width, getCanvasForeground().height);
    let current = destination;
    while (previous[current.label] !== null) {
        const prevVertex = previous[current.label];
        if (prevVertex) {
            prevVertex.paint(prevVertex.getX(), prevVertex.getY(), ctx);
            drawEdge(prevVertex, current, ctx);
            await delay(1);
            current = prevVertex;
        }
    }
    return { distances, previous };
};
