import { drawGraph } from './graph-ui/index';
// import { Bfs }         from './graph/paths/Bfs'
// import { Dfs }         from './graph/paths/Dfs'
// import { Prim }        from './graph/paths/Prim'
// import { Dijkstra }    from './graph/paths/Dijkstra'
import { FordFulkerson }  from './graph/paths/FordFulkerson';
import { setupPan, setupZoom, setupTooltip } from './ui/controls';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const wrapper = document.getElementById('canvas-wrapper')! as HTMLElement;
const canvas  = document.getElementById('app') as HTMLCanvasElement;

// ── Build graph ───────────────────────────────────────────────────────────────
const graph         = drawGraph();
const sourceVertex  = graph['691.2949333335273_264.2122222222388'];
const sinkVertex    = graph['1299.852444444783_1339.085555555299'];

console.log('[FF] Source:', sourceVertex?.label ?? 'NOT FOUND');
console.log('[FF] Sink:',   sinkVertex?.label   ?? 'NOT FOUND');

// ── UI controls ───────────────────────────────────────────────────────────────
setupPan(wrapper);
setupZoom(wrapper, canvas);
setupTooltip(canvas, graph);

// ── Algoritmos ────────────────────────────────────────────────────────────────
// Bfs(sourceVertex);
// Dfs(sourceVertex);
// Prim(sourceVertex);
// Dijkstra(sourceVertex);

// SOURCE_MULTIPLIER controla cuánto flujo puede inyectar el vértice fuente.
// Con 1 = capacidades reales (OSM lanes). El corte mínimo aparece en el punto
// naturalmente más estrecho entre source y sink — el cuello de botella real.
// Valores > 1 desplazan el corte hacia el sink (menos interesante visualmente).
const SOURCE_MULTIPLIER = 0;

FordFulkerson(sourceVertex, sinkVertex, SOURCE_MULTIPLIER).then((result) => {
    console.log('[FF] Max Flow:',               result.maxFlow);
    console.log('[FF] Augmenting paths found:', result.augmentingPaths.length);
    console.log('[FF] Bottlenecks:',            result.bottlenecks);
    console.log('[FF] Min-cut edges:',          result.minCutEdges.length);
}).catch((err) => {
    console.error('[FF] Error durante la ejecución:', err);
});