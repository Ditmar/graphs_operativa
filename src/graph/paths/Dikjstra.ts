import Vertex from '../Vertex';
import PriorityQueue from './PriorityQueue';

interface DijkstraResult {
    distances: Record<string, number>;
    previous: Record<string, string | null>;
}

export const Dijkstra = (start: Vertex, end: Vertex): DijkstraResult => {
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const pq = new PriorityQueue<Vertex>();

   
    distances[start.label] = 0;
    pq.enqueue(start, 0);

    start.getNeighbors().forEach((edge) => {
        if (edge.destination) {
            distances[edge.destination.label] = Infinity;
            previous[edge.destination.label] = null;
        }
    });

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
    
        if (!current) break;

        const currentVertex = current.element; 
        if (currentVertex.label === end.label) {
            break; 
        }

        currentVertex.getNeighbors().forEach((edge) => {
            const neighbor = edge.destination;
            if (!neighbor) return;

            const alt = distances[currentVertex.label] + edge.weight.valueOf();

            if (alt < (distances[neighbor.label] || Infinity)) {
                distances[neighbor.label] = alt;
                previous[neighbor.label] = currentVertex.label;
                pq.enqueue(neighbor, alt);
            }
        });
    }

    return { distances, previous };
};
