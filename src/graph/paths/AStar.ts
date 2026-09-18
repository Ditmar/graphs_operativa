import Vertex from '../Vertex';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay, calculateDistance } from '../../graph-ui/utils';

export interface AStarResult {
    source: Vertex;
    target: Vertex;
    totalDistance: number;
    visitedCount: number;
    /** Tiempo real de ejecución (incluye los delay(1) de animación, igual que Dijkstra). */
    elapsedMs: number;
    path: Vertex[];
    vertexList: Vertex[];
}

/**
 * A* es Dijkstra + una heurística: en vez de expandir siempre el nodo con
 * menor distancia acumulada (g), expande el de menor f = g + h, donde h es
 * la distancia en línea recta hasta el destino. Como h nunca sobreestima el
 * costo real restante (línea recta ≤ cualquier camino por calles), el
 * resultado sigue siendo óptimo — pero al "apuntar" hacia el destino, A*
 * suele visitar muchos menos nodos que Dijkstra, que explora por igual en
 * todas direcciones.
 */
export const AStar = async (source: Vertex, target: Vertex): Promise<AStarResult> => {
    const ctx = getCanvas().getContext('2d');
    const start = performance.now();

    source.distance = 0;
    source.predecessor = null;
    source.labelStatus = 'temporary';

    const heuristic = (v: Vertex) =>
        calculateDistance({ x: v.getX(), y: v.getY() }, { x: target.getX(), y: target.getY() });

    const fScore = new Map<Vertex, number>();
    fScore.set(source, heuristic(source));

    const open: Vertex[] = [source];
    let visitedCount = 0;
    const vertexList: Vertex[] = [];

    while (open.length > 0) {
        open.sort((a, b) => (fScore.get(a) ?? Infinity) - (fScore.get(b) ?? Infinity));
        const current = open.shift()!;
        current.labelStatus = 'permanent';
        current.setVisited(true);
        current.paint(current.getX(), current.getY(), ctx);
        visitedCount++;
        current.setLabelString(current.getDijkstraLabel());
        vertexList.push(current);
        await delay(1);

        if (current === target) break;

        current.getNeighbors().forEach((edge) => {
            const neighbor = edge.destination;
            if (!neighbor || neighbor.labelStatus === 'permanent') return;

            const newDist = current.distance + Number(edge.weight);

            if (newDist < neighbor.distance) {
                neighbor.distance = newDist;
                neighbor.predecessor = current;
                neighbor.labelStatus = 'temporary';
                fScore.set(neighbor, newDist + heuristic(neighbor));
                if (!open.includes(neighbor)) {
                    open.push(neighbor);
                }
            }
        });
    }

    const path: Vertex[] = [];
    let current: Vertex | null = target;
    while (current !== null) {
        path.unshift(current);
        current = current.predecessor;
    }
    drawShortestPath(path, ctx);

    const elapsedMs = performance.now() - start;

    const result: AStarResult = {
        source,
        target,
        totalDistance: target.distance,
        visitedCount,
        elapsedMs,
        path,
        vertexList,
    };

    return result;
};

function drawShortestPath(path: Vertex[], ctx: CanvasRenderingContext2D | null) {
    if (!ctx || path.length === 0) return;

    console.log('[A*] Camino mínimo:', path.map(v => `${v.label} ${v.getDijkstraLabel()}`).join(' → '));

    // Naranja para distinguirlo del amarillo que usa Dijkstra sobre el mismo mapa
    ctx.beginPath();
    ctx.strokeStyle = 'orange';
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
