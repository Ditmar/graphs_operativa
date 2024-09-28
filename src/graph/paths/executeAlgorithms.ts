// src/graph/main.ts

import { Dijkstra, reconstructPath } from './paths/Dijkstra';
import { Prim } from '../paths/Prim';
import Vertex from '../Vertex';

export const executeAlgorithms = (graph: { [key: string]: Vertex }, startLabel: string, endLabel: string) => {
    const start = graph[startLabel];
    const end = graph[endLabel];

    if (!start || !end) {
        console.error('Vértice de inicio o fin no encontrado en el grafo.');
        return;
    }

    // Ejecutar Dijkstra
    const startTimeDijkstra = performance.now();
    const resultDijkstra = Dijkstra(start, end);
    const endTimeDijkstra = performance.now();

    const path = reconstructPath(resultDijkstra.previous, start, end);

    console.log(`Dijkstra - Ruta más corta desde ${startLabel} hasta ${endLabel}:`);
    console.log(path.map((vertex: { label: any; }) => vertex.label).join(' -> '));
    console.log(`Distancia total: ${resultDijkstra.distances[endLabel]}`);
    console.log(`Tiempo de ejecución Dijkstra: ${endTimeDijkstra - startTimeDijkstra} ms`);

    // Ejecutar Prim
    const startTimePrim = performance.now();
    const resultPrim = Prim(start);
    const endTimePrim = performance.now();

    console.log(`Prim - Árbol de Expansión Mínima generado desde ${startLabel}:`);
    console.log(resultPrim.mst);
    console.log(`Tiempo de ejecución Prim: ${endTimePrim - startTimePrim} ms`);
};
