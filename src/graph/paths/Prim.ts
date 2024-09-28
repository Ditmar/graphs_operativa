
import Vertex from '../Vertex';
import PriorityQueue from './PriorityQueue'; 
interface PrimResult {
    mst: { [key: string]: Vertex[] }; 
}

export const Prim = (start: Vertex): PrimResult => {
    const mst: { [key: string]: Vertex[] } = {}; 
    const visited = new Set<Vertex>();
    const pq = new PriorityQueue<Vertex>();

    pq.enqueue(start, 0);

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        
        if (!current) break;

        const currentVertex = current.element; 
        if (!visited.has(currentVertex)) {
            visited.add(currentVertex);
            mst[currentVertex.label] = [];

            currentVertex.getNeighbors().forEach((edge) => {
                const neighbor = edge.destination;

                if (neighbor && !visited.has(neighbor)) {
                    pq.enqueue(neighbor, edge.weight.valueOf());
                    mst[currentVertex.label].push(neighbor);
                }
            });
        }
    }

    return { mst };
};
