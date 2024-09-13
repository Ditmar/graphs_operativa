import Vertex from "../Vertex";
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';
const ctx = getCanvas().getContext('2d');
export const Dfs = (vertex: Vertex) => {
    vertex.getNeighbors().forEach(async(edge) => {
        const neighbor = edge.destination;
        if (neighbor && !neighbor.visited) {
            neighbor.setVisited(true);
            neighbor.paint(neighbor.getX(), neighbor.getY(), ctx);
            await delay(1);
            Dfs(neighbor);
        }
    });
}