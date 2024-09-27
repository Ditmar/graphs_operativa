import { optionSelect, drawButton, clearButton, sourceSelect, destinationSelect, destinationDiv } from "./Elements";
import { getCanvasForeground } from "../canvas/canvas";
import { Dfs } from "../../graph/paths/Dfs";
import Vertex from "../../graph/Vertex";
import { Bfs } from "../../graph/paths/Bfs";
import { Dijkstra } from "../../graph/dijkstra/Dijkstra";
import { Prim } from "../../graph/prim/Prim";

export async function InitializeGraphUI(graph: Record<string, Vertex>) {
    const option = optionSelect();
    const drawBtn = drawButton();
    const clearBtn = clearButton();

    option.addEventListener('click', () => {
        destinationDiv().style.display = (option.value === 'Dijkstra') ? 'block' : 'none';
    });
    clearBtn.disabled = true;

    drawBtn.addEventListener('click', async () => {
        await drawAlgorithm(option.value, graph);
        clearBtn.disabled = false;
    });

    clearBtn.addEventListener('click', async () => {
        await clearDraw();
        clearBtn.disabled = true;
        Object.values(graph).forEach(vertex => {
            vertex.setVisited(false);
        });
    });
}

async function drawAlgorithm(algorithm: string, graph: Record<string, Vertex>) {
    const sourceVertex = graph[sourceSelect().value];
    switch (algorithm) {
        case 'Dfs':
            await Dfs(sourceVertex);
            break;
        case 'Bfs':
            await Bfs(sourceVertex);
            break;
        case 'Dijkstra':
            Dijkstra(sourceVertex, graph[destinationSelect().value]);
            break;
        case 'Prim':
            await Prim(sourceVertex);
            break;
    }
}

async function clearDraw() {
    const canvas = getCanvasForeground();
    const ctx = canvas.getContext('2d');
    if (ctx === null) throw new Error('Failed to get 2D context');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export const vertexLabelSelector = async (graph: Record<string, Vertex>) => {
    const source = document.getElementById('source') as HTMLSelectElement;
    const destination = document.getElementById('destination') as HTMLSelectElement;

    const createOptionsFragment = (vertices: Vertex[]): DocumentFragment => {
        const fragment = document.createDocumentFragment();
        vertices.forEach(vertex => {
            const option = document.createElement('option');
            option.value = vertex.label;
            option.text = vertex.label;
            fragment.appendChild(option);
        });
        return fragment;
    };

    if (source && destination) {
        const optionsFragment = createOptionsFragment(Object.values(graph));
        source.appendChild(optionsFragment.cloneNode(true));
        destination.appendChild(optionsFragment);
    }
};
