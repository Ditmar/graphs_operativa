import Vertex from '../Vertex';
import Edge from '../Edge';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';

export const Prim = async (source: Vertex) => {
    const ctx = getCanvas().getContext('2d');
    const edgeQueue: Edge[] = [];

    source.setVisited(true);
    source.paint(source.getX(), source.getY(), ctx);

    // Agregar todas las aristas del vertice inicial
    source.getNeighbors().forEach((edge) => {
        edgeQueue.push(edge);
    });
    edgeQueue.sort((a, b) => Number(a.weight) - Number(b.weight));

    while (edgeQueue.length > 0) {
        const minEdge = edgeQueue.shift()!;
        const neighbor = minEdge.destination;
        if (!neighbor || neighbor.visited) continue;

        neighbor.setVisited(true);

        // Dibujar la arista del MST
        if (ctx && minEdge.source) {
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 1.5;
            ctx.moveTo(minEdge.source.getX(), minEdge.source.getY());
            ctx.lineTo(neighbor.getX(), neighbor.getY());
            ctx.stroke();
        }

        neighbor.paint(neighbor.getX(), neighbor.getY(), ctx);
        await delay(1);
        neighbor.getNeighbors().forEach((edge) => {
            if (edge.destination && !edge.destination.visited) {
                edgeQueue.push(edge);
            }
        });

        // Re-ordenar por peso
        edgeQueue.sort((a, b) => Number(a.weight) - Number(b.weight));
    }
};
