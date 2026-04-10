import Vertex from '../Vertex';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';

export interface DijkstraResult {
    /** Vértice origen */
    source: Vertex;
    /** Vértice destino (undefined si se corrió sin destino) */
    target: Vertex | undefined;
    /** Distancia mínima del origen al destino (Infinity si no se alcanzó) */
    totalDistance: number;
    /** Cantidad de nodos que se volvieron permanentes */
    visitedCount: number;
    /** Secuencia de vértices del camino mínimo (vacío si no hay destino) */
    path: Vertex[];
}

export const Dijkstra = async (source: Vertex, target?: Vertex): Promise<DijkstraResult> => {
    const ctx = getCanvas().getContext('2d');

    // Inicializar etiqueta del origen: [0, -]
    source.distance = 0;
    source.predecessor = null;
    source.labelStatus = 'temporary';

    // Conjunto de vertices con etiqueta temporal (no procesados aun)
    const unvisited: Vertex[] = [source];
    let visitedCount = 0;

    while (unvisited.length > 0) {
        // Seleccionar vertice con menor distancia temporal (etiqueta minima)
        unvisited.sort((a, b) => a.distance - b.distance);
        const current = unvisited.shift()!;

        // Hacer la etiqueta permanente
        current.labelStatus = 'permanent';
        current.setVisited(true);
        current.paint(current.getX(), current.getY(), ctx);
        visitedCount++;
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

    // Reconstruir camino minimo si hay destino
    const path: Vertex[] = [];
    if (target) {
        let current: Vertex | null = target;
        while (current !== null) {
            path.unshift(current);
            current = current.predecessor;
        }
        drawShortestPath(path, ctx);
    }

    const totalDistance = target ? target.distance : source.distance;

    const result: DijkstraResult = {
        source,
        target,
        totalDistance,
        visitedCount,
        path,
    };

    console.log('── Dijkstra Result ─────────────────────────────────');
    console.log('[Dijkstra] Nodos visitados (permanentes):', result.visitedCount);
    if (target) {
        console.log('[Dijkstra] Distancia total (px):', result.totalDistance === Infinity ? '∞ (destino inalcanzable)' : result.totalDistance.toFixed(2));
        console.log('[Dijkstra] Camino mínimo:', result.path.map(v => v.label).join(' → '));
    }

    return result;
};

function drawShortestPath(path: Vertex[], ctx: CanvasRenderingContext2D | null) {
    if (!ctx || path.length === 0) return;

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
