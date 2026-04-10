import Vertex from '../Vertex';
import getCanvas from '../../graph-ui/canvas/canvas';
//import { delay } from '../../graph-ui/utils';

export interface DijkstraResult {
    source: Vertex;
    target: Vertex | undefined;
    totalDistance: number;
    visitedCount: number;
    path: Vertex[];
    vertexList: Vertex[];

}

export const Dijkstra = async (source: Vertex, target?: Vertex): Promise<DijkstraResult> => {
    const ctx = getCanvas().getContext('2d');
    source.distance = 0;
    source.predecessor = null;
    source.labelStatus = 'temporary';
    const unvisited: Vertex[] = [source];
    let visitedCount = 0;
    const vertexList: Array<Vertex> = [];
    while (unvisited.length > 0) {
        unvisited.sort((a, b) => a.distance - b.distance);
        const current = unvisited.shift()!;
        current.labelStatus = 'permanent';
        current.setVisited(true);
        current.paint(current.getX(), current.getY(), ctx);
        visitedCount++;
        current.setLabelString(current.getDijkstraLabel());
        vertexList.push(current);
        if (target && current === target) break;
        current.getNeighbors().forEach((edge) => {
            const neighbor = edge.destination;
            if (!neighbor || neighbor.labelStatus === 'permanent') return;

            const newDist = current.distance + Number(edge.weight);

            if (newDist < neighbor.distance) {
                neighbor.distance = newDist;
                neighbor.predecessor = current;
                neighbor.labelStatus = 'temporary';
                if (!unvisited.includes(neighbor)) {
                    unvisited.push(neighbor);
                }
            }
        });
    }

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
        vertexList,
    };

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
