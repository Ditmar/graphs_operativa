import { optionSelect, drawButton, clearButton, sourceSelect, destinationSelect, destinationDiv } from "./Elements";
import { getCanvasForeground } from "../graph-ui/canvas/canvas";
import { Dfs } from "../graph/paths/Dfs";
import Vertex from "../graph/Vertex";
import { Bfs } from "../graph/paths/Bfs";
import { Dijkstra } from "../graph/dijkstra/Dijkstra";
import { Prim } from "../graph/prim/Prim";


export async function Run(graph: Record<string, Vertex>){
    let option = optionSelect();
    let drawBtn = drawButton();
    let clearBtn = clearButton();

    option.addEventListener('click', ()=>{
        if(option.value == 'Dijkstra'){
            destinationDiv().style.display = 'block';
        }else{
            destinationDiv().style.display = 'none';
        }
        
    })
    clearBtn.disabled = true;
    drawBtn.addEventListener('click', async()=>{
        await drawAlgorithm(option.value, graph);
        clearBtn.disabled = false;
    })
    clearBtn.addEventListener('click', async()=>{
        await clearDraw();
        clearBtn.disabled = true;
        Object.values(graph).forEach(vertex => {
            vertex.setVisited(false);
        });
    })
}


async function drawAlgorithm(algorithm: string, graph: Record<string, Vertex>){
    switch(algorithm){
        case 'Dfs':
            await Dfs(graph[sourceSelect().value]);
            break;
        case 'Bfs':
            await Bfs(graph[sourceSelect().value]);
            break;
        case 'Dijkstra':
            Dijkstra(graph[sourceSelect().value], graph[destinationSelect().value]);
            break;
        case 'Prim':
            await Prim(graph[sourceSelect().value]);
            break;
    }
}

async function clearDraw(){
    const canvas = getCanvasForeground();
    const ctx = canvas.getContext('2d');
    if(ctx === null)
        throw new Error('Failed to get 2D context');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}