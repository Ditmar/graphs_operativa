import { drawGraph } from './graph-ui/index';
import { Dijkstra } from './graph/dijkstra/Dijkstra';
import { Prim } from './graph/prim/Prim';
import { Dfs } from './graph/paths/Dfs';
import { Bfs } from './graph/paths/Bfs';

const graph = drawGraph();
// await Dijkstra(graph['114.42353777773678_229.00422222237103'], graph['1057.628800000064_306.54866666696034']);
await Prim(graph['114.42353777773678_229.00422222237103']);
// await Dfs(graph['114.42353777773678_229.00422222237103']);
// await Bfs(graph['114.42353777773678_229.00422222237103']);

