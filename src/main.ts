import { drawGraph } from './graph-ui/index';
import { Dijkstra } from './graph/dijkstra/Dijkstra';
import { Prim } from './graph/prim/Prim';
import { Dfs } from './graph/paths/Dfs';
import { Bfs } from './graph/paths/Bfs';
const graph = drawGraph();
await Dijkstra(graph['114.42353777773678_229.00422222237103'], graph['500.52501333341934_450.13266666652635']);
//await Prim(graph['500.52501333341934_450.13266666652635']);
//await Dfs(graph['500.52501333341934_450.13266666652635']);
//await Bfs(graph['500.52501333341934_450.13266666652635']);

