import Vertex from '../Vertex';
import Edge from '../Edge';
import MinHeap from './MinHeap';
import { getCanvasForeground } from '../../graph-ui/canvas/canvas';
import { delay, drawEdge } from '../../graph-ui/utils';

export const Prim = async (startVertex: Vertex): Promise<Edge[]> => {
    const mst: Edge[] = [];
    const visitedVertices: Set<string> = new Set();
    const edgeQueue = new MinHeap();
    const ctx = getCanvasForeground().getContext('2d');
    
    if (!ctx) {
        throw new Error('No se pudo obtener el contexto 2D');
    }

    addNeighborEdgesToQueue(startVertex, edgeQueue);
    
    while (!edgeQueue.isEmpty()) {
        const smallestEdgeData = edgeQueue.extractMin();
        if (!smallestEdgeData) continue;

        const { edge: currentEdge } = smallestEdgeData;
        const { source: sourceVertex, destination: destinationVertex } = currentEdge;
        
        if (!destinationVertex || visitedVertices.has(destinationVertex.label)) {
            continue;
        }

        visitedVertices.add(destinationVertex.label);
        await paintAndConnectVertices(ctx, sourceVertex, destinationVertex, currentEdge);
        addNeighborEdgesToQueue(destinationVertex, edgeQueue, visitedVertices);
    }

    return mst;
};

const addNeighborEdgesToQueue = (vertex: Vertex, edgeQueue: MinHeap, visitedVertices: Set<string> = new Set()): void => {
    for (const edge of vertex.getNeighbors()) {
        if (!edge.destination || visitedVertices.has(edge.destination.label)) {
            continue;
        }
        edgeQueue.insert(edge, edge.weight);
    }
};

const paintAndConnectVertices = async (ctx: CanvasRenderingContext2D, sourceVertex: Vertex | null, destinationVertex: Vertex, edge: Edge): Promise<void> => {
    if (sourceVertex) {
        destinationVertex.paint(destinationVertex.getX(), destinationVertex.getY(), ctx);
        await delay(1);
        drawEdge(sourceVertex, destinationVertex, ctx);
    }
};
