import Vertex from '../Vertex';
import Edge from '../Edge';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';

export const Dijkstra = class {
    private vertices: number;
    private adjMatrix: number[][];

    constructor(vertices: number) {
        this.vertices = vertices;
        this.adjMatrix = Array.from({ length: vertices }, () =>
            Array(vertices).fill(Infinity)
        );
    }

    addEdge(src: number, dest: number, weight: number) {
        this.adjMatrix[src][dest] = weight;
        this.adjMatrix[dest][src] = weight; 
    }

    dijkstra(src: number) {
        const dist = Array(this.vertices).fill(Infinity);
        const sptSet = Array(this.vertices).fill(false);
        dist[src] = 0;

        for (let count = 0; count < this.vertices - 1; count++) {
            const u = this.minDistance(dist, sptSet);
            sptSet[u] = true;

            for (let v = 0; v < this.vertices; v++) {
                if (
                    !sptSet[v] &&
                    this.adjMatrix[u][v] !== Infinity &&
                    dist[u] !== Infinity &&
                    dist[u] + this.adjMatrix[u][v] < dist[v]
                ) {
                    dist[v] = dist[u] + this.adjMatrix[u][v];
                }
            }
        }

        this.printSolution(dist);
    }

    private minDistance(dist: number[], sptSet: boolean[]): number {
        let min = Infinity;
        let minIndex = -1;

        for (let v = 0; v < this.vertices; v++) {
            if (!sptSet[v] && dist[v] < min) {
                min = dist[v];
                minIndex = v;
            }
        }

        return minIndex;
    }

    private printSolution(dist: number[]) {
        console.log('Vertex \t Distance from Source');
        for (let i = 0; i < this.vertices; i++) {
            console.log(`${i} \t ${dist[i]}`);
        }
    }
};