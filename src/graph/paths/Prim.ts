import Vertex from '../Vertex';
import Edge from '../Edge';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';

export interface PrimResult {
    /** Lista de aristas que forman el MST, ordenadas por peso ascendente */
    mstEdges: Edge[];
    /** Suma total de los pesos de las aristas del MST */
    totalWeight: number;
    /** Número de aristas en el MST */
    edgeCount: number;
    /** Número de vértices alcanzados */
    vertexCount: number;
}

export const Prim = async (source: Vertex): Promise<PrimResult> => {
    const ctx = getCanvas().getContext('2d');
    const edgeQueue: Edge[] = [];
    const mstEdges: Edge[] = [];
    let totalWeight = 0;
    let vertexCount = 1;

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
        vertexCount++;
        mstEdges.push(minEdge);
        totalWeight += Number(minEdge.weight);

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

    // Ordenar mstEdges por peso ascendente para facilitar análisis
    const sortedEdges = [...mstEdges].sort((a, b) => Number(a.weight) - Number(b.weight));

    const result: PrimResult = {
        mstEdges: sortedEdges,
        totalWeight,
        edgeCount: mstEdges.length,
        vertexCount,
    };

    console.log('── Prim Result ─────────────────────────────────────');
    console.log('[Prim] Vértices alcanzados:', result.vertexCount);
    console.log('[Prim] Aristas en el MST:  ', result.edgeCount);
    console.log('[Prim] Peso total (px):    ', result.totalWeight.toFixed(2));
    console.log('[Prim] Arista más corta:   ', `${result.mstEdges[0]?.source?.label} → ${result.mstEdges[0]?.destination?.label} (${Number(result.mstEdges[0]?.weight).toFixed(2)} px)`);
    const lastEdge = result.mstEdges[result.mstEdges.length - 1];
    console.log('[Prim] Arista más larga:   ', `${lastEdge?.source?.label} → ${lastEdge?.destination?.label} (${Number(lastEdge?.weight).toFixed(2)} px)`);

    return result;
};
