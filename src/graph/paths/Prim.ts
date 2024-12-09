import Vertex from '../Vertex';
import Edge from '../Edge';

export const primAlgorithm = (startVertex: Vertex): Edge[] => {
    const mst: Edge[] = [];
    const visited = new Set<Vertex>();
    const edges: Edge[] = [];

    const addEdges = (vertex: Vertex) => {
        visited.add(vertex);
        vertex.getNeighbors().forEach(edge => {
            if (!visited.has(edge.getDestination()!)) {
                edges.push(edge);
            }
        });
    };

    addEdges(startVertex);

    while (edges.length) {
        edges.sort((a, b) => a.getWeight() - b.getWeight());
        const smallestEdge = edges.shift();

        if (smallestEdge) {
            const destination = smallestEdge.getDestination()!;
            if (!visited.has(destination)) {
                mst.push(smallestEdge);
                addEdges(destination);
            }
        }
    }

    return mst; 
};
