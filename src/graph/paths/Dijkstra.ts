import Vertex from '../Vertex';
import Edge from '../Edge';

export const dijkstraAlgorithm = (startVertex: Vertex) => {
    const distances: Map<Vertex, number> = new Map();
    const previous: Map<Vertex, Vertex | null> = new Map();
    const visited = new Set<Vertex>();

    distances.set(startVertex, 0);
    previous.set(startVertex, null);

    const vertices: Vertex[] = Array.from(distances.keys());

    while (vertices.length) {
        vertices.sort((a, b) => (distances.get(a) || Infinity) - (distances.get(b) || Infinity));
        const currentVertex = vertices.shift()!;

        if (!currentVertex || visited.has(currentVertex)) {
            continue;
        }

        visited.add(currentVertex);

        currentVertex.getNeighbors().forEach(edge => {
            const neighbor = edge.getDestination()!;
            const newDist = (distances.get(currentVertex) || Infinity) + edge.getWeight();

            if (newDist < (distances.get(neighbor) || Infinity)) {
                distances.set(neighbor, newDist);
                previous.set(neighbor, currentVertex);
                if (!visited.has(neighbor)) {
                    vertices.push(neighbor);
                }
            }
        });
    }

    return { distances, previous };
};
