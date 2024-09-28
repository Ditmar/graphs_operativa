import Vertex from '../Vertex';
import { getCanvasForeground } from '../../graph-ui/canvas/canvas';
import { delay, drawEdge } from '../../graph-ui/utils';
import MinHeap from './MinHeap';

export const Dijkstra = async (initialVertex: Vertex, goalVertex: Vertex) => {
    if (initialVertex === goalVertex) {
        alert("El vértice inicial y el de destino son los mismos");
        return;
    }

    const shortestDistances: Record<string, number> = { [initialVertex.label]: 0 };
    const previousVertices: Record<string, Vertex | null> = {};
    const priorityQueue = new MinHeap();
    priorityQueue.insert(initialVertex, 0);

    const ctx = getCanvasForeground().getContext('2d');
    if (!ctx) {
        throw new Error('No se pudo obtener el contexto 2D');
    }

    while (!priorityQueue.isEmpty()) {
        const currentNode = priorityQueue.extractMin();
        if (!currentNode) break;

        const { vertex: currentVertex, distance: currentDistance } = currentNode;
        currentVertex.paint(currentVertex.getX(), currentVertex.getY(), ctx);
        await delay(1);

        await exploreNeighbors(currentVertex, currentDistance, shortestDistances, previousVertices, priorityQueue, ctx);
        
        if (currentVertex === goalVertex) break;
    }

    await drawShortestPath(goalVertex, previousVertices, ctx);
    return { shortestDistances, previousVertices };
};

const exploreNeighbors = async (
    currentVertex: Vertex,
    currentDistance: number,
    shortestDistances: Record<string, number>,
    previousVertices: Record<string, Vertex | null>,
    priorityQueue: MinHeap,
    ctx: CanvasRenderingContext2D
) => {
    for (const edge of currentVertex.getNeighbors()) {
        const neighbor = edge.destination;
        const edgeWeight = edge.weight || 0;

        if (neighbor) {
            const newDistance = currentDistance + edgeWeight;
            if (newDistance < (shortestDistances[neighbor.label] || Infinity)) {
                shortestDistances[neighbor.label] = newDistance;
                previousVertices[neighbor.label] = currentVertex;
                priorityQueue.insert(neighbor, newDistance);
                drawEdge(currentVertex, neighbor, ctx);
                await delay(1);
            }
        }
    }
};

const drawShortestPath = async (
    goalVertex: Vertex,
    previousVertices: Record<string, Vertex | null>,
    ctx: CanvasRenderingContext2D
) => {
    ctx.clearRect(0, 0, getCanvasForeground().width, getCanvasForeground().height);
    let currentVertex: Vertex = goalVertex;

    while (previousVertices[currentVertex.label] !== null) {
        const previousVertex = previousVertices[currentVertex.label];
        if (previousVertex) {
            previousVertex.paint(previousVertex.getX(), previousVertex.getY(), ctx);
            drawEdge(previousVertex, currentVertex, ctx);
            await delay(1);
            currentVertex = previousVertex;
        }
    }
};
