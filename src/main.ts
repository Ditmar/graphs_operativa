import { drawGraph } from './graph-ui/index';
import { Bfs } from './graph/paths/Bfs'
const graph = drawGraph();

console.log(graph['500.52501333341934_450.13266666652635']);
Bfs(graph['500.52501333341934_450.13266666652635']);
// import { createGraph } from './graph/main';

// createGraph();