import Vertex from "../Vertex";
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';
import PriorityQueue from 'js-priority-queue';

const ctx = getCanvas().getContext('2d');

export const Dijkstra = async (source: Vertex) => {
    const distances = new Map();
    const previousVertices = new Map();
    const queue = new PriorityQueue({ comparator: (a, b) => (a as { vertex: Vertex; distance: number }).distance - (b as { vertex: Vertex; distance: number }).distance });
    distances.set(source, 0);
    queue.queue({ vertex: source, distance: 0 });
    while (queue.length > 0) {
        const { vertex: currentVertex } = queue.dequeue() as { vertex: Vertex };
        currentVertex.paint(currentVertex.getX(), currentVertex.getY(), ctx);
        await delay(1);
        for (const edge of currentVertex.getNeighbors()) {
            const neighbor = edge.destination;
            const weight = edge.weight;
            const alternativeDistance = distances.get(currentVertex) + weight;
            if (alternativeDistance < (distances.get(neighbor) || Infinity)) {
                distances.set(neighbor, alternativeDistance);
                previousVertices.set(neighbor, currentVertex);
                queue.queue({ vertex: neighbor, distance: alternativeDistance });
            }
        }
    }
    return { distances, previousVertices };
};