import Vertex from "../Vertex";
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';
import PriorityQueue from 'js-priority-queue';  

const ctx = getCanvas().getContext('2d');

export const Prim = async (startVertex: Vertex) => {
    const visited = new Set<Vertex>();
    const pq = new PriorityQueue<{ source: Vertex; destination: Vertex; weight: number }>({
        comparator: (a: { weight: number }, b: { weight: number }) => a.weight - b.weight
    });
    const edges: Array<{ source: Vertex; destination: Vertex; weight: number }> = []; // Aristas del árbol de expansión mínima
    const addEdges = (vertex: Vertex) => {
        vertex.getNeighbors().forEach(edge => {
            if (edge.source && edge.destination && !visited.has(edge.destination)) {
                pq.queue({ source: edge.source, destination: edge.destination, weight: edge.weight.valueOf() });
            }
        });
    };

    visited.add(startVertex);
    addEdges(startVertex);
    while (pq.length > 0) {
        const edge = pq.dequeue();
        if (!edge) continue; 
        const vertex = edge.destination;
        if (visited.has(vertex)) continue; 
        visited.add(vertex);
        edges.push(edge);
        ctx!.beginPath();
        ctx!.moveTo(edge.source.getX(), edge.source.getY());
        ctx!.lineTo(vertex.getX(), vertex.getY());
        ctx!.stroke();
        await delay(1);
        vertex.paint(vertex.getX(), vertex.getY(), ctx);
        addEdges(vertex);
    }
    return edges; 
};