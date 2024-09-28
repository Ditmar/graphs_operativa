import Vertex from '../Vertex';
import Edge from '../Edge';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';

export const Prim = class Graph {
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

    primMST() {
        const parent = Array(this.vertices).fill(-1);
        const key = Array(this.vertices).fill(Infinity);
        const inMST = Array(this.vertices).fill(false);

        key[0] = 0;

        for (let count = 0; count < this.vertices - 1; count++) {
            const u = this.minKey(key, inMST);
            inMST[u] = true;

            for (let v = 0; v < this.vertices; v++) {
                if (
                    this.adjMatrix[u][v] &&
                    !inMST[v] &&
                    this.adjMatrix[u][v] < key[v]
                ) {
                    parent[v] = u;
                    key[v] = this.adjMatrix[u][v];
                }
            }
        }

        this.printMST(parent);
    }

    private minKey(key: number[], inMST: boolean[]): number {
        let min = Infinity;
        let minIndex = -1;

        for (let v = 0; v < this.vertices; v++) {
            if (!inMST[v] && key[v] < min) {
                min = key[v];
                minIndex = v;
            }
        }

        return minIndex;
    }

    private printMST(parent: number[]) {
        console.log('Edge \tWeight');
        for (let i = 1; i < this.vertices; i++) {
            console.log(`${parent[i]} - ${i} \t${this.adjMatrix[i][parent[i]]}`);
        }
    }
}



