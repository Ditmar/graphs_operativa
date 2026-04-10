import Vertex from '../Vertex';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';

export const Dijkstra = async (source: Vertex, target?: Vertex) => {
    const ctx = getCanvas().getContext('2d');

    // Inicializar etiqueta del origen: [0, -]
    source.distance = 0;
    source.predecessor = null;
    source.labelStatus = 'temporary';

    // Conjunto de vertices con etiqueta temporal (no procesados aun)
    const unvisited: Vertex[] = [source];

    while (unvisited.length > 0) {
        // Seleccionar vertice con menor distancia temporal (etiqueta minima)
        unvisited.sort((a, b) => a.distance - b.distance);
        const current = unvisited.shift()!;

        // Hacer la etiqueta permanente
        current.labelStatus = 'permanent';
        current.setVisited(true);
        current.paint(current.getX(), current.getY(), ctx);
        console.log(`Permanente: ${current.label} ${current.getDijkstraLabel()}`);

        await delay(1);

        // Si llegamos al destino, parar
        if (target && current === target) break;

        // Relajar aristas
        current.getNeighbors().forEach((edge) => {
            const neighbor = edge.destination;
            if (!neighbor || neighbor.labelStatus === 'permanent') return;

            const newDist = current.distance + Number(edge.weight);

            if (newDist < neighbor.distance) {
                // Actualizar etiqueta temporal del vecino
                neighbor.distance = newDist;
                neighbor.predecessor = current;
                neighbor.labelStatus = 'temporary';
                console.log(`  Temporal: ${neighbor.label} ${neighbor.getDijkstraLabel()}`);

                if (!unvisited.includes(neighbor)) {
                    unvisited.push(neighbor);
                }
            }
        });
    }

    // Si hay destino, reconstruir y dibujar el camino minimo
    if (target) {
        drawShortestPath(target, ctx);
    }
};

function drawShortestPath(target: Vertex, ctx: CanvasRenderingContext2D | null) {
    if (!ctx) return;

    const path: Vertex[] = [];
    let current: Vertex | null = target;

    while (current !== null) {
        path.unshift(current);
        current = current.predecessor;
    }

    console.log('Camino minimo:', path.map(v => `${v.label} ${v.getDijkstraLabel()}`).join(' → '));

    // Dibujar el camino en amarillo
    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;

    path.forEach((vertex, index) => {
        if (index === 0) {
            ctx.moveTo(vertex.getX(), vertex.getY());
        } else {
            ctx.lineTo(vertex.getX(), vertex.getY());
        }
    });
    ctx.stroke();
}
