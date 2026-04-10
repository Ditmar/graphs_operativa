import { drawGraph } from './graph-ui/index';
// import { Bfs }         from './graph/paths/Bfs'
// import { Dfs }         from './graph/paths/Dfs'
import { Prim }        from './graph/paths/Prim'
import { Dijkstra }    from './graph/paths/Dijkstra'
import { FordFulkerson }  from './graph/paths/FordFulkerson';
import { setupPan, setupZoom, setupTooltip } from './ui/controls';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const wrapper = document.getElementById('canvas-wrapper')! as HTMLElement;
const canvas  = document.getElementById('app') as HTMLCanvasElement;

// ── Build graph ───────────────────────────────────────────────────────────────
const graph         = drawGraph();

const  sourceVertex   = graph['737.4545777775347_409.59055555518717'];
const sinkVertex  = graph['2010.7672888888046_776.5538888890296'];

// ── UI controls ───────────────────────────────────────────────────────────────
setupPan(wrapper);
setupZoom(wrapper, canvas);
setupTooltip(canvas, graph);

// ── Algoritmos ────────────────────────────────────────────────────────────────
// Bfs(sourceVertex);
// Dfs(sourceVertex);
 Prim(sourceVertex);
//Dijkstra(sourceVertex);

/** Demanda de tráfico a enrutar.
 *  - Infinity  → calcula el flujo máximo real (comportamiento original)
 *  - Número    → intenta enrutar exactamente esa cantidad de unidades.
 *                Si la red se satura antes, los cuellos de botella quedan
 *                marcados en rojo con el % de saturación alcanzado.
 */
// const DEMAND = 100;

// FordFulkerson(sourceVertex, sinkVertex, DEMAND).then((result) => {
//     console.log('[FF] Demand:',              result.demand === Infinity ? '∞' : result.demand);
//     console.log('[FF] Max Flow:',            result.maxFlow);
//     console.log('[FF] Saturation:',          `${(result.saturationRatio * 100).toFixed(1)}%`);
//     console.log('[FF] Saturated:',           result.isSaturated);
//     console.log('[FF] Augmenting paths:',    result.augmentingPaths.length);
//     console.log('[FF] Bottlenecks:',         result.bottlenecks);
//     console.log('[FF] Min-cut edges:',       result.minCutEdges.length);
// }).catch((err) => {
//     console.error('[FF] Error durante la ejecución:', err);
// });