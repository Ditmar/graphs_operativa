import { drawGraph } from './graph-ui/index';
// import { Bfs }         from './graph/paths/Bfs'
// import { Dfs }         from './graph/paths/Dfs'
// import { Prim }        from './graph/paths/Prim'
// import { Dijkstra }    from './graph/paths/Dijkstra'
import { FordFulkerson }  from './graph/paths/FordFulkerson';
import { setupPan, setupZoom, setupTooltip, findFarthestReachable } from './ui/controls';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const wrapper = document.getElementById('canvas-wrapper')! as HTMLElement;
const canvas  = document.getElementById('app') as HTMLCanvasElement;

// ── Build graph ───────────────────────────────────────────────────────────────
const graph       = drawGraph();
const startVertex = graph['500.52501333341934_450.13266666652635'];

// ── UI controls ───────────────────────────────────────────────────────────────
setupPan(wrapper);
setupZoom(wrapper, canvas);
setupTooltip(canvas, graph);

// ── Algoritmos ────────────────────────────────────────────────────────────────
// Bfs(startVertex);
// Dfs(startVertex);
// Prim(startVertex);
// Dijkstra(startVertex);

const sourceVertex = startVertex;
const sinkVertex   = findFarthestReachable(sourceVertex);

FordFulkerson(sourceVertex, sinkVertex).then((result) => {
    console.log('[FF] Max Flow:',         result.maxFlow);
    console.log('[FF] Augmenting paths:', result.augmentingPaths);
    console.log('[FF] Bottlenecks:',      result.bottlenecks);
    console.log('[FF] Min-cut edges:',    result.minCutEdges);
});