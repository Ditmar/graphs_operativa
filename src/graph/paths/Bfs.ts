import Vertex from '../Vertex';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';
export const Bfs = async(source: Vertex) => {
    const queue: Vertex[] = [];
    source.setVisited(true);
    queue.push(source);
    const ctx = getCanvas().getContext('2d')!;    while (queue.length > 0) {
        const currentVertex = queue.shift();
        currentVertex?.paint(currentVertex.getX(), currentVertex.getY(), ctx);
        await delay(1)
        currentVertex?.getNeighbors().forEach((edge) => {
            const neighbor = edge.destination;
            if (neighbor && !neighbor.visited) {
                neighbor.setVisited(true);
                queue.push(neighbor);
            }
        });
    }
}