import { drawGraph } from './graph-ui/index';
import { Bfs } from './graph/paths/Bfs'
import { Prim } from './graph/paths/Prim'
import { Dijkstra } from './graph/paths/Dijkstra.ts'
import { Dfs } from './graph/paths/Dfs'
import { delay } from './graph-ui/utils.ts';
import Vertex from './graph/Vertex.ts';

const graph = drawGraph();

const coordenadaA = '844.2203733334318_462.0793333335314';
const coordenadaB = '369.16856888867915_419.0246666665189';

if (!graph[coordenadaA]) {
    console.error(`el vertice ${coordenadaA} no existe en el grafo`);
} else if (!graph[coordenadaB]) {
    console.error(`el vertice ${coordenadaB} no existe en el grafo`);
} else {
    Dijkstra(graph[coordenadaA], graph[coordenadaB]).then(() => {
        console.log('ruta mas corta entre ' + coordenadaA + " y " + coordenadaB + ' encontrada y pintada.');
    });
}

/*
if (!graph[coordenadaA]) {
    console.error(`el vertice ${coordenadaA} no existe en el grafo`);
} else {
    const prim = new Prim(graph);
    console.time('tiempo de ejecucion de Prim');
    const mstEdges = prim.execute(coordenadaA);
    console.timeEnd('tiempo de ejecucion de Prim');
    prim.paintMST(mstEdges);
    console.log('el arbol de expansion minima fue encontrado y pintado.');
}
/*
console.time("tiempo ejecucion de Bfs");
Bfs(graph['393.5374933334533_363.18644444434904']);
console.timeEnd("tiempo ejecucion de Bfs");

console.time("tiempo ejecucion de Dfs");
Dfs(graph['488.49870222224854_471.26177777792327']);
console.timeEnd("tiempo ejecucion de Dfs");
*/