import Vertex from "../Vertex";
import { getCanvasForeground } from '../../graph-ui/canvas/canvas';
import { delay, drawEdge } from '../../graph-ui/utils';


export const Dfs = async (vertex: Vertex): Promise<void> => {
    const ctx = getCanvasForeground().getContext('2d');
    if (ctx === null) {
        throw new Error('Failed to get 2D context');
    }
    vertex.paint(vertex.getX(), vertex.getY(), ctx);
    await delay(1);
    const promises = vertex.getNeighbors().map(async edge => {
        const neighbor = edge.destination;

        if (neighbor && !neighbor.visited) {
            neighbor.setVisited(true);
            drawEdge(vertex, neighbor, ctx);
            await delay(1);
            await Dfs(neighbor); 
        }
    });
    await Promise.all(promises);
};