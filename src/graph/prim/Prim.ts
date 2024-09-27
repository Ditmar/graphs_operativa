import Vertex from '../Vertex';
import Edge from '../Edge';
import MinHeap from './MinHeap';
import { getCanvasForeground } from '../../graph-ui/canvas/canvas';
import { delay, drawEdge } from '../../graph-ui/utils';

export const Prim = async (startVertex: Vertex): Promise<Edge[]> => {
    const mstEdges: Edge[] = [];
    const visited: Set<string> = new Set();
    const minHeap = new MinHeap();
    const ctx = getCanvasForeground().getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get 2D context');
    }
    addEdgesToHeap(startVertex, minHeap);
    while (!minHeap.isEmpty()) {
        const currentEdgeData = minHeap.extractMin();
        if (!currentEdgeData) continue;
        const { edge: currentEdge } = currentEdgeData;
        const { source: currentVertex, destination: neighbor } = currentEdge;
        if (!neighbor || visited.has(neighbor.label)) {
            continue;
        }
        visited.add(neighbor.label);
        await paintAndDrawEdge(ctx, currentVertex, neighbor, currentEdge);
        addEdgesToHeap(neighbor, minHeap, visited);
    }
    return mstEdges;
};

const addEdgesToHeap = (vertex: Vertex, minHeap: MinHeap, visited: Set<string> = new Set()): void => {
    for (const edge of vertex.getNeighbors()) {
        if (!edge.destination || visited.has(edge.destination.label)) {
            continue;
        }
        minHeap.insert(edge, edge.weight);
    }
};
const paintAndDrawEdge = async (ctx: CanvasRenderingContext2D, currentVertex: Vertex | null, neighbor: Vertex, edge: Edge): Promise<void> => {
    if (currentVertex) {
        neighbor.paint(neighbor.getX(), neighbor.getY(), ctx);
        await delay(1);
        drawEdge(currentVertex, neighbor, ctx);
    }
};
