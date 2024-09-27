import Vertex from '../Vertex';
import { getCanvasForeground } from '../../graph-ui/canvas/canvas';
import { delay, drawEdge } from '../../graph-ui/utils';

export const Bfs = async (source: Vertex): Promise<void> => {
    const queue: Vertex[] = [];
    source.setVisited(true);
    queue.push(source);
    const ctx = getCanvasForeground().getContext('2d');
    if (ctx === null) {
        throw new Error('Failed to get 2D context');
    }

    while (queue.length > 0) {
        const currentVertex = queue.shift();
        if (currentVertex) {
            currentVertex.paint(currentVertex.getX(), currentVertex.getY(), ctx);
            await delay(1); 
            for (const edge of currentVertex.getNeighbors()) {
                const neighbor = edge.destination;
                if (neighbor && !neighbor.visited) {
                    neighbor.setVisited(true);
                    queue.push(neighbor);
                    drawEdge(currentVertex, neighbor, ctx);
                    await delay(1); 
                }
            }
        }
    }
};
