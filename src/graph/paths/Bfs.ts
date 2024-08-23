import Vertex from '../Vertex';

export const Bfs = (source: Vertex) => {
    const queue: Vertex[] = [];
    source.setVisited(true);
    queue.push(source);
    while (queue.length > 0) {
        const currentVertex = queue.shift();
        console.log(currentVertex?.label);
        currentVertex?.getNeighbors().forEach((edge) => {
            const neighbor = edge.destination;
            if (neighbor && !neighbor.visited) {
                neighbor.setVisited(true);
                queue.push(neighbor);
            }
        });
    }
}