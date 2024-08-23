import Edge from "./Edge";

class Vertex {
    label: string;
    neighbors: Edge[] = [];
    visited: boolean = false;
    constructor(label: string) {
        this.label = label;
    }
    getNeighbors() { 
        return this.neighbors;
    }
    setVisited(visited: boolean) {
        this.visited = visited;
    }
    addNeighbor(destination: Vertex, weight: Number | null) {
        const edge: Edge = new Edge(null, this);
        edge.setDestination(destination);
        edge.setLabel(`${this.label}_${destination.label}`);
        if (weight) {
            edge.setWeight(weight);
        }
        this.neighbors.push(edge);
        return edge;
    }
}
export default Vertex;