import { Bfs } from './paths/Bfs';
import Vertex from './Vertex';

export const createGraph = () => {
    const v1 = new Vertex('v1');
    const v2 = new Vertex('v2');
    const v3 = new Vertex('v3');
    const v4 = new Vertex('v4');
    const v5 = new Vertex('v5');
    const v6 = new Vertex('v6');

    v1.addNeighbor(v2, 2);
    v1.addNeighbor(v5, 3);
    v2.addNeighbor(v3, 1);
    v3.addNeighbor(v1, 1);
    v3.addNeighbor(v4, 5);
    v3.addNeighbor(v6, 2);
    v4.addNeighbor(v2, 1);
    v5.addNeighbor(v3, 1);
    v6.addNeighbor(v4, 3);
    v6.addNeighbor(v5, 3);
    Bfs(v1);
}
