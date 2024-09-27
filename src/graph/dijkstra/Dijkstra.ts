import Vertex from '../Vertex';
import { getCanvasForeground } from '../../graph-ui/canvas/canvas';
import { delay, drawEdge } from '../../graph-ui/utils';
import MinHeap from './MinHeap';

export const Dijkstra = async (source: Vertex, destination: Vertex) => {
    if (source === destination) {
        alert("El origen y el destino son el mismo");
        return;
    }

    const distances: Record<string, number> = { [source.label]: 0 };
    const previous: Record<string, Vertex | null> = {};
    const minHeap = new MinHeap();
    minHeap.insert(source, 0);

    const ctx = getCanvasForeground().getContext('2d');
    if (!ctx) {
        throw new Error('Fallo al obtener el contexto 2D');
    }

    while (!minHeap.isEmpty()) {
        const current = minHeap.extractMin();
        if (!current) break;

        const { vertex: currentVertex, distance: currentDistance } = current;
        currentVertex.paint(currentVertex.getX(), currentVertex.getY(), ctx);
        await delay(1);

        await processNeighbors(currentVertex, currentDistance, distances, previous, minHeap, ctx);
        
        if (currentVertex === destination) break;
    }

    await drawShortestPath(destination, previous, ctx);
    return { distances, previous };
};

const processNeighbors = async (
    currentVertex: Vertex,
    currentDistance: number,
    distances: Record<string, number>,
    previous: Record<string, Vertex | null>,
    minHeap: MinHeap,
    ctx: CanvasRenderingContext2D
) => {
    for (const edge of currentVertex.getNeighbors()) {
        const neighbor = edge.destination;
        const weight = edge.weight || 0;

        if (neighbor) {
            const newDistance = currentDistance + weight;
            if (newDistance < (distances[neighbor.label] || Infinity)) {
                distances[neighbor.label] = newDistance;
                previous[neighbor.label] = currentVertex;
                minHeap.insert(neighbor, newDistance);
                drawEdge(currentVertex, neighbor, ctx);
                await delay(1);
            }
        }
    }
};

const drawShortestPath = async (
    destination: Vertex,
    previous: Record<string, Vertex | null>,
    ctx: CanvasRenderingContext2D
) => {
    ctx.clearRect(0, 0, getCanvasForeground().width, getCanvasForeground().height);
    let current: Vertex = destination;

    while (previous[current.label] !== null) {
        const prevVertex = previous[current.label];
        if (prevVertex) {
            prevVertex.paint(prevVertex.getX(), prevVertex.getY(), ctx);
            drawEdge(prevVertex, current, ctx);
            await delay(1);
            current = prevVertex;
        }
    }
};
