import Vertex from '../Vertex';
import Edge from '../Edge';
import MinHeap from './MinHeap';
import { getCanvasForeground } from '../../graph-ui/canvas/canvas';
import { delay, drawEdge } from '../../graph-ui/utils';

export const Prim = async (startVertex: Vertex) => {
    const mstEdges: Edge[] = [];
    const visited: Set<string> = new Set(); 
    const minHeap = new MinHeap();
    const ctx = getCanvasForeground().getContext('2d');
    if (ctx === null) {
        throw new Error('Failed to get 2D context');
    }
    for (const edge of startVertex.getNeighbors()) {
        minHeap.insert(edge, edge.weight);
    }
    while (!minHeap.isEmpty()) {
        const currentEdgeData = minHeap.extractMin();
        if (!currentEdgeData) continue;

        const { edge: currentEdge } = currentEdgeData;
        const { source: currentVertex, destination: neighbor } = currentEdge;
        if (!neighbor || visited.has(neighbor.label)) {
            continue;
        }
        visited.add(neighbor.label);
        neighbor.paint(neighbor.getX(), neighbor.getY(), ctx);
        await delay(1);

        if(!currentVertex){
            continue
        }
        drawEdge(currentVertex, neighbor, ctx);
        mstEdges.push(currentEdge);
        for (const edge of neighbor.getNeighbors()) {
            if (!edge.destination || !visited.has(edge.destination.label)) {
                minHeap.insert(edge, edge.weight);
            }
        }
    }

    return mstEdges;
};